import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001


const rawAllowed = process.env.ALLOWED_CLIENTS_ORIGIN || process.env.allowed_clients_origin || process.env.FRONTEND_ORIGIN || '*'
let allowedOrigins = []
if (rawAllowed === '*') {
    allowedOrigins = ['*']
} else {
    allowedOrigins = rawAllowed.split(',').map((s) => s.trim()).filter(Boolean)
}

console.log('Allowed origins:', allowedOrigins)

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., curl, server-to-server)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes('*')) return callback(null, true)
        return allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'), false)
    },
}
app.use(cors(corsOptions))
app.use(express.json())

// Trust proxy so req.ip honors X-Forwarded-For when behind a proxy (Render, Vercel, etc.)
// Set TRUST_PROXY=false to disable explicit trust.
if (process.env.TRUST_PROXY !== 'false') {
    app.set('trust proxy', 1)
}

// IP allowlist - only allow requests from the configured IPs when set
const rawAllowedIPs = process.env.ALLOWED_CLIENTS_IP || process.env.allowed_clients_ip || ''
let allowedIPs = []
if (rawAllowedIPs && rawAllowedIPs.length > 0) {
    if (rawAllowedIPs.trim() === '*') {
        allowedIPs = ['*']
    } else {
        allowedIPs = rawAllowedIPs.split(',').map((s) => s.trim()).filter(Boolean)
    }
}

const normalizeIp = (ip) => {
    if (!ip) return ''
    // Remove IPv6 wrapper ::ffff:127.0.0.1
    if (ip.startsWith('::ffff:')) return ip.split('::ffff:')[1]
    if (ip === '::1') return '127.0.0.1'
    return ip
}

// IP check middleware
app.use((req, res, next) => {
    if (allowedIPs.length === 0) return next() // not configured => allow all
    if (allowedIPs.includes('*')) return next()
    const forwarded = req.headers['x-forwarded-for']
    const ip = normalizeIp((forwarded && String(forwarded).split(',')[0].trim()) || req.ip || req.connection.remoteAddress)
    if (!ip) return res.status(403).json({ error: 'Access denied (unknown IP)' })
    if (allowedIPs.includes(ip)) return next()
    return res.status(403).json({ error: `Access denied from IP ${ip}` })
})

const SENDGRID_KEY = process.env.SENDGRID_API_KEY
const TO_EMAIL = process.env.TO_EMAIL
const FROM_EMAIL = process.env.FROM_EMAIL || TO_EMAIL

if (!SENDGRID_KEY) console.error('Missing SENDGRID_API_KEY in environment')
if (!TO_EMAIL) console.error('Missing TO_EMAIL in environment')

sgMail.setApiKey(SENDGRID_KEY)

app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Server ativo' })
})

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields: name, email, message' })
    }

    try {
        // email para você (TO_EMAIL)
        const adminMsg = {
            to: TO_EMAIL,
            from: FROM_EMAIL,
            subject: `Novo contato: ${name} <${email}>`,
            text: `Nova mensagem de ${name} <${email}>:\n\n${message}`,
            html: `<p><strong>Nova mensagem de ${name} &lt;${email}&gt;:</strong></p><pre>${message}</pre>`,
        }

        // confirmação para o remetente
        const userMsg = {
            to: email,
            from: FROM_EMAIL,
            subject: `Recebemos sua mensagem — Obrigado, ${name}`,
            text: `Olá ${name},\n\nRecebemos sua mensagem e vamos responder em breve.\n\nResumo:\n${message}`,
            html: `<p>Olá ${name},</p><p>Recebemos sua mensagem e vamos responder em breve.</p><h4>Sua mensagem</h4><pre>${message}</pre>`,
        }

        await sgMail.send(adminMsg)
        await sgMail.send(userMsg)

        return res.json({ ok: true, sentTo: [TO_EMAIL, email] })
    } catch (err) {
        console.error('Erro ao enviar e-mail', err)
        return res.status(500).json({ error: 'Erro interno ao enviar e-mail' })
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})