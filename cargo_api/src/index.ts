import { Host } from 'unet'
import { Safe, Now, log, env, isDev } from 'utils'

import { Sequelize, DataTypes, Op } from 'sequelize'
import { faker } from '@faker-js/faker'
import 'dotenv/config'

Safe(async () => {

    const API = new Host({ name: 'cargo', port: 5051, timeout: 25000, redis: false })

    API.on('me', (req) => req.connection.remoteAddress)

    if (env.DB_NAME && env.DB_USER && env.DB_PASS) {

        const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {

            dialect: 'postgres',
            host: env.DB_HOST,
            pool: { max: 16, min: 4, acquire: 30000, idle: 15000 },
            logging: (sql) => {

                /* console.log('***')
                console.log(sql) */

            },

        })

        /** Items **/
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

        API.on('items', async (req) => {

            const { text = '*' } = req.query
            const result = await items.findAll({
                where: {
                    [Op.or]: [
                        { code: { [Op.like]: `${text}%` } },
                        { phone: { [Op.like]: `${text}%` } }
                    ]
                }
            })
            return result

        })

        /** Calculation **/
        const is_dev = env.MODE === 'development'

        await sequelize.sync({ force: true, alter: true })

        for (let i = 0; i < 100; i++) {

            await items.upsert({
                code: faker.internet.mac(),
                phone: faker.phone.number(),
                state: faker.system.mimeType(),
                description: faker.music.album(),
                price: faker.number.int({ min: 5000, max: 100000 }),
            })

        }


    } else log.error(`Please check database credentials!`)

}, 'cargo_api')