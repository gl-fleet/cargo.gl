import { useState, useMemo, useRef, useEffect } from 'react'
import { Layout, Flex, Typography, Image, Button, Input, Form, Table, Grid, Card, Col, Row, InputNumber, Popconfirm, Badge } from 'antd'
import { FacebookOutlined, InstagramOutlined, MailOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { createGlobalStyle } from 'styled-components'

import { React, Render } from 'uweb'
import { Connection } from 'unet/web'

const { Header, Footer, Sider, Content } = Layout
const { Paragraph, Text } = Typography
const { useBreakpoint } = Grid
const { Search } = Input

const Style = createGlobalStyle`

    #root > .ant-float-btn-group {
        display: none !important;
    }

    .ant-form-item-row,
    .ant-form-item-control-input {
        height: 100%;
        background: #fff;
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

const EditableCell: any = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}: any) => {

    const border: any = { border: 'none', borderLeft: '2px dashed blue', borderRadius: 0 }
    const inputNode = inputType === 'number' ? <InputNumber style={border} /> : <Input style={border} />
    return (
        <td {...restProps}>
            {editing ? (<>
                {children}
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0, position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
                >{inputNode}</Form.Item>
            </>
            ) : (children)}
        </td>
    )
}

export default ({ isDarkMode }: { isDarkMode: boolean }) => {

    const [form] = Form.useForm()
    const [editingKey, setEditingKey] = useState('');
    const isEditing = (record: any) => record.id === editingKey

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('***')
    const [desc, setDesc] = useState<any>('***')
    const [items, setItems] = useState<any>([])
    const screens: any = useBreakpoint()

    const cargo = useMemo(() => new Connection({ name: 'cargo', proxy: 'http://localhost:5051' }), [])

    const handleSave = async (record: any, type = 'upsert') => {

        try {

            const row = (await form.validateFields())
            const newData = [...items]
            const index = newData.findIndex((item) => record.id === item.id)

            console.log('Save', record, row)

            cargo.push('items', { ...record, ...row, type }, (err, data) => {
                console.log(err, data)
                setEditingKey('')
            })

            if (index > -1) {
                const item = newData[index]
                newData.splice(index, 1, { ...item, ...row })
                setItems(newData)
                setEditingKey('')
            } else {
                newData.push(row)
                setItems(newData)
                setEditingKey('')
            }

        } catch (errInfo) {
            console.log('Validate Failed:', errInfo)
        }

    }

    const edit = (record: any) => {
        console.log('Edit', record)
        form.setFieldsValue({ code: '', phone: '', state: '', description: '', price: 0, ...record })
        setEditingKey(record.id)
    }

    const handleAdd = () => {
        const newData: any = { id: `#${Date.now()}`, code: '', phone: '', state: '', description: '', price: 0 }
        console.log('Add', newData)
        setItems([newData, ...items])
    }

    const cancel = () => {
        console.log('Cancel', editingKey)
        setEditingKey('')
    }

    const onSearch = (value: any) => {

        setLoading(true)

        const text = value.replace(/[^a-z0-9]/gi, '')

        cargo.get('items', { text }).then((e: any) => {

            if (Array.isArray(e)) {

                let ls = [...e]
                setItems(ls)
                setMessage(`Found ${ls.length} items`)

                let price = 0

                for (const i of ls) {

                    console.log(i)
                    price += i.price

                }

                const mnt = new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(price).replace('MNT', '₮')
                setDesc(<span>A total of <b>{ls.length}</b> items, with a shipping cost of <b>{mnt}</b></span>)

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
            editable: true,
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            hidden: detect <= 2,
            editable: true,
        },
        {
            title: 'State',
            dataIndex: 'state',
            hidden: detect <= 2,
            editable: true,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            editable: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            editable: true,
            render: (_: any) => new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(_).replace('MNT', '₮')
        },
        {
            title: 'Actions',
            render: (_: any, record: any) => {

                const editable = isEditing(record)
                return editable ? (
                    <center>
                        <Typography.Link onClick={() => handleSave(record, 'upsert')} style={{ marginInlineEnd: 8 }}>
                            <SaveOutlined />
                        </Typography.Link>
                        <Typography.Link onClick={cancel}>
                            <CloseOutlined />
                        </Typography.Link>
                    </center>
                ) : (
                    <center>
                        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{ marginInlineEnd: 8 }}>
                            <EditOutlined />
                        </Typography.Link>
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleSave(record, 'delete')}>
                            <a><DeleteOutlined style={{ fontSize: 13 }} /></a>
                        </Popconfirm>
                    </center>
                )

            }
        },
    ].filter(item => !item.hidden)

    const mergedColumns: any = columns.map((col) => {

        if (!col.editable) return col

        return {
            ...col,
            onCell: (record: any) => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        }

    })

    const onDataChange = (e: any) => {

        console.log(e)

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
                            allowClear={true}
                            onSearch={(value) => onSearch(value)}
                        />
                        <span style={{ display: message ? 'block' : 'none', paddingTop: 12 }}>{message}</span>
                    </Col>

                    <Col span={24}>

                        <Badge.Ribbon style={{ marginTop: -18 }} text={<a onClick={() => handleAdd()}>Add</a>}>
                            <Form form={form} component={false}>
                                <Table
                                    loading={loading}
                                    bordered
                                    size={'small'}
                                    rowKey={'id'}
                                    rowClassName="editable-row"
                                    columns={mergedColumns}
                                    components={{ body: { cell: EditableCell } }}
                                    dataSource={items}
                                    pagination={false}
                                    footer={() => <div>{desc}</div>}
                                />
                            </Form>
                        </Badge.Ribbon>

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