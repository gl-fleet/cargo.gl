import { Sequelize, DataTypes, Op, UUIDV4 } from 'sequelize'
import { ushort, Safe, Now, log, env } from 'utils'
import { faker } from '@faker-js/faker'
import jwt from 'jsonwebtoken'
import { Host } from 'unet'
import 'dotenv/config'

Safe(async () => {

    const API = new Host({ name: 'cargo', port: 5051, timeout: 25000, redis: false })

    const isValid = (token: string) => {

        try {
            jwt.verify(token, env.CL_KEY ?? '*')
            return true
        } catch (err) {
            return false
        }

    }

    API.on('me', (req) => {

        const { token = '*' } = req.body

        console.log(`[me] Token: ${token}`)
        if (isValid(token)) return true
        else throw new Error('Invalid token!')

    })

    API.on('login', (req) => {

        const { user = '*', pass = '*' } = req.body

        console.log(`[login] User: ${user} Pass: ${pass}`)
        console.log(`[env] Env User: ${env.CL_USER} Env Pass: ${env.CL_PASS}`)

        if (env.CL_USER === user && env.CL_PASS === pass) {

            console.log('Generating token...')
            const token = jwt.sign({ user }, env.CL_KEY ?? '*', { expiresIn: '14d' })
            console.log(`[login] Token: ${token}`)
            return token

        }
        else {

            console.log(`[login] no match for User: ${user} Pass: ${pass}`)
            throw new Error('Invalid credentials!')

        }

    })

    if (env.DB_NAME && env.DB_USER && env.DB_PASS) {

        const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {

            dialect: 'postgres',
            host: env.DB_HOST,
            pool: { max: 16, min: 4, acquire: 30000, idle: 15000 },
            logging: false // (q, o: any) => { console.log(o.where) },

        })

        /** Table creation **/
        const items = sequelize.define("items", {

            id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
            code: { type: DataTypes.STRING, defaultValue: '' },
            phone: { type: DataTypes.STRING, defaultValue: '' },
            state: { type: DataTypes.STRING, defaultValue: '' },
            description: { type: DataTypes.TEXT, defaultValue: '' },
            price: { type: DataTypes.INTEGER, defaultValue: 0 },

            createdAt: { type: DataTypes.STRING, defaultValue: () => Now() },
            updatedAt: { type: DataTypes.STRING, defaultValue: () => Now() },
            deletedAt: { type: DataTypes.STRING, defaultValue: null },

        }, { indexes: [{ unique: false, fields: ['code', 'phone', 'updatedAt'] }] })

        /** Table creation **/
        API.on('items', async (req) => {

            const uid = ushort()
            const [{ method }, { text = '*' }, start] = [req, req.query, Date.now()]
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0'
            const { id, type } = req.body
            const qm = method === 'GET' ? 'select' : type === 'delete' ? 'delete' : typeof id === 'number' ? 'update' : 'create'
            const al = `[${method}-${uid}-${ip}-${qm}]:`
            console.log(`${al} --- ${method} ---`)

            try {

                const admin = isValid((req.headers.authorization || '*').replace('Bearer ', ''))
                if (['create', 'update', 'delete'].includes(qm) && !admin) throw new Error('Unauthorized access!')
                if (!admin && text.length < 8) return 'Search text too short!'

                if (qm === 'select') {

                    return await items.findAll({
                        where: {
                            [Op.or]: [
                                { code: { [Op.like]: `${text}%` } },
                                { phone: { [Op.like]: `${text}%` } }
                            ]
                        },
                        order: [['id', 'DESC']],
                    })

                }

                if (qm === 'create') {

                    const res = await items.create({
                        ...req.body,
                        id: null,
                    })

                    console.log(res)

                    return `${req.body.id} is created!`

                }

                if (qm === 'update') {

                    const res = await items.upsert(req.body)

                    console.log(res)

                    return `${req.body.id} is updated!`

                }

                if (qm === 'delete') {

                    const res = await items.destroy({
                        where: {
                            id: req.body.id
                        }
                    })

                    console.log(res)

                    return `${req.body.id} is deleted!`

                }

            } catch (e: any) {

                console.log(`${al} failed:${e.message} ${Date.now() - start}ms`)
                return `${e.message} ${Date.now() - start}ms`

            } finally {

                console.log(`${al} finished ${Date.now() - start}ms`)

            }

        })

        /** Table sync **/

        await sequelize.sync({ force: false, alter: true })

        /* for (let i = 0; i < 100; i++) {

            await items.upsert({
                code: faker.internet.mac(),
                phone: i % 10 === 0 ? 86566666 : faker.phone.number(),
                state: faker.system.mimeType(),
                description: faker.music.album(),
                price: faker.number.int({ min: 5000, max: 100000 }),
            })

        } */


    } else log.error(`Please check database credentials!`)

}, 'cargo_api')