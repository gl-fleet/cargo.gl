import { Layout, Flex, Typography, Image, Button, Input, Tag, theme } from 'antd'
import { Table, Grid, Card, Col, Row } from 'antd'
import { FacebookOutlined, InstagramOutlined, MailOutlined } from '@ant-design/icons'
import { useState, useMemo } from 'react'

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
    background: '#009688',
    height: 'auto',
    textAlign: 'center',
    padding: '16px 16px',
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
                const develop = window.location.hostname === 'localhost'
                const dns = develop ? 'http://localhost:1337' : 'http://143.198.198.77'
                const uri = `${dns}/api/items?filters[$or][0][phone_number][$eq]=${normal}&filters[$or][1][tracking_id][$eq]=${normal}&populate=*`

                const response = await fetch(uri)
                const { data } = await response.json()
                const parsed = data.map(({ id, attributes }) => {
                    const images = attributes?.image?.data?.map(({ attributes }) => `${dns}${attributes?.url}`)
                    return { id, ...attributes, images }
                })

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
            title: 'Images',
            dataIndex: 'images',
            render: (_) => <Image.PreviewGroup items={Array.isArray(_) ? _ : []} >
                <Image
                    width={36}
                    preview={Array.isArray(_)}
                    src={Array.isArray(_) ? _[0] ?? 'error' : 'error'}
                    fallback="data:image/png;base64,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"
                />
            </Image.PreviewGroup>
        },
        {
            title: 'Price',
            dataIndex: 'price',
        },
    ].filter(item => !item.hidden)

    return <Flex gap="middle" wrap="wrap">
        <Layout style={layoutStyle} theme="light">

            <Header style={headerStyle}>
                <Image src="/gobi.png" preview={false} style={{ maxWidth: 320 }} />
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
                            className='bg-green'
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