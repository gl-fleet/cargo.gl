import { Layout, Flex, Typography, Image, Button, Input, QRCode, Tag, theme } from 'antd'
import { Table, Grid, Card, Col, Row, Space } from 'antd'
import { FacebookOutlined, InstagramOutlined, MailOutlined } from '@ant-design/icons'
import { useEffect, useState, useMemo } from 'react'

const { Header, Footer, Sider, Content } = Layout
const { Paragraph, Text } = Typography
const { useBreakpoint } = Grid
const { Search } = Input

const asn = {
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

const headerStyle = {
    display: 'block',
    position: 'relative',
    background: '#1677ff',
    height: 'auto',
    textAlign: 'center',
}

const contentStyle = {
    textAlign: 'center',
    padding: 16,
    paddingTop: 32,
    minHeight: 120,
}

const footerStyle = {
    padding: 16,
}

const { useToken } = theme

export default () => {

    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState([])

    const screens = useBreakpoint()
    const { token } = useToken()

    const onSearch = (value) => {

        setLoading(true)

        setTimeout(async () => {

            try {

                const normal = value.replace(/[^a-z0-9]/gi, '')
                const dns = `143.198.198.77` // localhost:1337
                const uri = `http://${dns}/api/items?filters[$or][0][phone_number][$eq]=${normal}&filters[$or][1][tracking_id][$eq]=${normal}`

                const response = await fetch(uri)
                const { data } = await response.json()
                const parsed = data.map(({ id, attributes }) => ({ id, ...attributes }))

                console.log(`[${normal}]`, parsed)
                setItems(parsed)

            } catch (err) { } finally { setLoading(false) }


        }, 0)

    }

    const detect = useMemo(() => {

        let max = 0
        for (const x in screens) if (screens[x] === true && asn[x] > max) max = asn[x]
        return max

    }, [screens])

    const columns = [
        {
            title: 'Tracking ID',
            key: 'tracking_id',
            dataIndex: 'tracking_id',
            render: (_) => <Tag color={'geekblue'}>{_}</Tag>
        },
        {
            title: 'Name',
            dataIndex: 'name',
            hidden: detect <= 2,
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_number',
            hidden: detect <= 2,
        },
        {
            title: 'Location',
            dataIndex: 'location',
            render: (_) => <Tag>{_}</Tag>
        },
        {
            title: 'Price',
            dataIndex: 'price',
        },
    ].filter(item => !item.hidden)

    return <Flex gap="middle" wrap="wrap">
        <Layout style={layoutStyle} theme="light">

            <Header style={headerStyle}>
                <Image src="/logo512.png" style={{ maxWidth: 320 }} />
                <Flex gap="small" vertical style={{ position: 'absolute', top: 16, right: 16 }}>
                    <Flex wrap="wrap" gap="small">
                        <Button href="#" type="default" shape="circle" icon={<FacebookOutlined />} />
                        <Button href="#" type="default" shape="circle" icon={<InstagramOutlined />} />
                        <Button href="#" type="default" shape="circle" icon={<MailOutlined />} />
                    </Flex>
                </Flex>
            </Header>

            <Content style={contentStyle}>
                <Row gutter={[16, 32]}>

                    <Col span={24}>
                        <Search
                            style={{ maxWidth: 480 }}
                            placeholder="Enter [Phone Number] or [Tracking ID] ..."
                            enterButton="Search"
                            size="large"
                            allowClear
                            onSearch={(value) => onSearch(value)}
                        />
                    </Col>

                    <Col span={24}>
                        <Table
                            loading={loading}
                            bordered
                            size={'small'}
                            rowKey={'tracking_id'}
                            columns={columns}
                            dataSource={items}
                            pagination={false}
                        />
                    </Col>

                </Row>
            </Content>

            <Footer style={footerStyle}>
                <Row gutter={[16, 16]}>
                    <Col span={24} lg={12}>
                        <Card title="Shipping Address" bordered={false} size="small">
                            <Paragraph copyable>收货人: 巴雅尔</Paragraph>
                            <Paragraph copyable>手机号码: 15548868265</Paragraph>
                            <Paragraph copyable>所在地区: 内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局</Paragraph>
                            <Paragraph copyable>详细地址: 欧亚中蒙商业街A68号巴雅尔 [Нэр],[Утасны дугаар]</Paragraph>
                        </Card>
                    </Col>
                    <Col span={24} lg={12}>
                        <Card title="Contact Us" bordered={false} size="small">
                            <Paragraph copyable>Утас/MN/: +976 7777-1111</Paragraph>
                            <Paragraph copyable>Даваа-Баасан 09:00-18:00</Paragraph>
                            <Paragraph copyable>Бямба 11:00-18:00</Paragraph>
                            <Paragraph copyable>Ням гарагт амарна</Paragraph>
                        </Card>
                    </Col>
                </Row>
            </Footer>

        </Layout>
    </Flex>

}