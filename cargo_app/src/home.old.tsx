import { useState, useMemo, useRef, useEffect } from 'react'
import { Layout, Flex, Typography, Image, Button, Input, Tag, theme, Table, Grid, Card, Col, Row } from 'antd'
import { FacebookOutlined, InstagramOutlined, MailOutlined } from '@ant-design/icons'
import { createGlobalStyle } from 'styled-components'

import { React, Render } from 'uweb'
import { Connection } from 'unet/web'

import Spreadsheet from "react-spreadsheet"
import isEqual from 'react-fast-compare'

const { Header, Footer, Sider, Content } = Layout
const { Paragraph, Text } = Typography
const { useBreakpoint } = Grid
const { Search } = Input

const Style = createGlobalStyle`

    #root > .ant-float-btn-group {
        display: none !important;
    }
    .Spreadsheet {
        width: 100%;
        margin-bottom: 16px;
    }
    .Spreadsheet table {
        width: 100%;
    }
    .Spreadsheet tr > th:nth-child(1) {
        width: 5%;
    }
    .Spreadsheet tr > th:nth-child(2) {
        width: 15%;
    }
    .Spreadsheet tr > th:nth-child(3) {
        width: 10%;
    }
    .Spreadsheet tr > th:nth-child(6) {
        width: 10%;
    }
    .Spreadsheet table th {
        font-weight: 600;
    }

`

const asn: any = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 6,
}

const layoutStyle = {
    borderRadius: '8px',
    width: '100%',
    maxWidth: '1280px',
    margin: 'auto',
    overflow: 'hidden',
}

const headerStyle: any = {
    display: 'block',
    position: 'relative',
    background: 'transparent',
    height: 'auto',
    textAlign: 'center',
    padding: '16px 16px 0px 16px',
}

const contentStyle: any = {
    textAlign: 'center',
    padding: 16,
    paddingTop: 32,
    minHeight: 120,
}

const footerStyle: any = {
    padding: 16,
}

const def = Array(10).fill(Array(5))

export default ({ isDarkMode }: { isDarkMode: boolean }) => {

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('***')
    const [items, setItems] = useState<any>([])
    const [desc, setDesc] = useState<any>('***')

    const columnLabels: any = ["Code", "Phone", "State", "Description", "Price"]
    const [rowLabels, setRowLabels]: any = useState([])

    const prev = useRef(def)
    const [data, setData]: any = useState(def)

    const screens: any = useBreakpoint()
    const cargo = useMemo(() => new Connection({ name: 'cargo', proxy: 'http://localhost:5051' }), [])

    const onSearch = (value: any) => {

        setLoading(true)

        const text = value.replace(/[^a-z0-9]/gi, '')

        cargo.get('items', { text }).then((e: any) => {

            if (Array.isArray(e)) {

                let ls = [...e]
                setItems(ls)
                setMessage(`Found ${ls.length} items`)

                let price = 0
                let sps = []
                let ids = []

                for (const i of ls) {

                    console.log(i)
                    price += i.price
                    ids.push(i.id)
                    sps.push([
                        { value: i.code },
                        { value: i.phone },
                        { value: i.state },
                        { value: i.description },
                        { value: i.price },
                    ])

                }

                const mnt = new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(price).replace('MNT', '₮')
                setDesc(<span>A total of <b>{ls.length}</b> items, with a shipping cost of <b>{mnt}</b></span>)
                setData([...sps, ...def])
                setRowLabels([...ids])

            }

        }).catch((e) => {

            setMessage(e?.response?.data ?? '')

        }).finally(() => setLoading(false))

    }

    const detect = useMemo(() => {

        let max = 0
        for (const x in screens) if (screens[x] === true && asn[x] > max) max = asn[x]
        return max

    }, [screens])

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            hidden: detect <= 2,
        },
        {
            title: 'State',
            dataIndex: 'state',
            hidden: detect <= 2,
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (_: any) => new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(_).replace('MNT', '₮')
        },
    ].filter(item => !item.hidden)

    const onDataChange = (e: any) => {

        if (!isEqual(prev.current, e)) {

            console.log(e)
            prev.current = e
            setData([...e])

        }

    }

    const onSubmit = (e: any) => {

        console.log(e)

    }

    return <Flex gap="middle" wrap="wrap" style={{ backgroundColor: '#f5f5f5' }}>

        <Style />

        <Layout style={layoutStyle}>

            <Header style={headerStyle}>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Image src="main-1.png" preview={false} style={{ maxWidth: 320 }} />
                        <Flex gap="small" vertical style={{ position: 'absolute', top: 16, right: 16 }}>
                            <Flex wrap="wrap" gap="small">
                                <Button href="#" type="default" shape="circle" icon={<FacebookOutlined />} />
                                <Button href="#" type="default" shape="circle" icon={<InstagramOutlined />} />
                                <Button href="#" type="default" shape="circle" icon={<MailOutlined />} />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Header>

            <Content style={contentStyle}>
                <Row gutter={[16, 16]}>

                    <Col span={24}>
                        <Search
                            className='bg-green'
                            style={{ maxWidth: 480 }}
                            placeholder="Enter Phone or Code ..."
                            enterButton="Search"
                            size="large"
                            allowClear
                            onSearch={(value) => onSearch(value)}
                        />
                        <span style={{ display: message ? 'block' : 'none', paddingTop: 12 }}>{message}</span>
                    </Col>

                    <Col span={24}>

                        <Spreadsheet
                            data={data}
                            onChange={onDataChange}
                            columnLabels={columnLabels}
                            rowLabels={rowLabels}
                        />

                        <Table
                            loading={loading}
                            bordered
                            size={'small'}
                            rowKey={'tracking_id'}
                            columns={columns}
                            dataSource={items}
                            pagination={false}
                            footer={() => <div>{desc}</div>}
                        />

                    </Col>

                </Row>
            </Content>

            <Footer style={footerStyle}>
                <Row gutter={[16, 16]}>
                    <Col span={24} lg={12}>
                        <Card title="Shipping Address" bordered={false} size="small">
                            <Paragraph>收货人: <Paragraph copyable style={{ display: 'inline' }}>巴雅尔</Paragraph></Paragraph>
                            <Paragraph>手机号码: <Paragraph copyable style={{ display: 'inline' }}>15548868265</Paragraph></Paragraph>
                            <Paragraph>所在地区: <Paragraph copyable style={{ display: 'inline' }}>内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局</Paragraph></Paragraph>
                            <Paragraph>详细地址: <Paragraph copyable style={{ display: 'inline' }}>欧亚中蒙商业街A68号巴雅尔 [Нэр],[Утасны дугаар]</Paragraph></Paragraph>
                        </Card>
                    </Col>
                    <Col span={24} lg={12}>
                        <Card title="Contact Us" bordered={false} size="small">
                            <Paragraph>Утас/MN/: <Paragraph copyable style={{ display: 'inline' }}>+97677771111</Paragraph></Paragraph>
                            <Paragraph>Даваа-Баасан 09:00-18:00</Paragraph>
                            <Paragraph>Бямба 11:00-18:00</Paragraph>
                            <Paragraph>Ням гарагт амарна</Paragraph>
                        </Card>
                    </Col>
                </Row>
            </Footer>

        </Layout>
    </Flex>

}