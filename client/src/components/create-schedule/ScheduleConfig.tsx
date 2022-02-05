import { Form, Input, InputNumber, TimePicker } from "antd";
import { CSSProperties, useEffect } from "react";
import { MIN_DAYS } from "../../constants";


const ScheduleConfig = ({ validateStep, formData, setFormData }: any) => {
    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: '${label} is not a valid email!',
            number: '${label} is not a valid number!',
        },
        number: {
            range: '${label} must be between ${min} and ${max}',
        },
    };

    const formLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 3 },
    };

    const formStyles: CSSProperties = {
        textAlignLast: 'left'
    }
    const onFinish = (formm: any) => {
        Object.keys(formm).map((k: string) => {
            // trim text content
            if (typeof (formm as any)[k] === 'string') {
                (formm as any)[k] = (formm as any)[k].trim();
            }
        })
    }


    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(formData)
    }, [])

    const validateFields = () => {
        validateStep('wait')
        form.validateFields().then((v) => {
            setFormData(v);
            validateStep('finish')
        }, (err) => {
            validateStep('error');
        })
    }

    return (
        <Form {...formLayout}
            form={form}
            style={formStyles}
            onChange={validateFields}
            name="create-room"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            validateMessages={validateMessages}>
            <Form.Item name={['name']}
                label="Schedule name"
                rules={[{ required: true, max: 15, whitespace: false },]}>
                <Input />
            </Form.Item>
            <Form.Item
                name={['stake']}
                label="Stake"
                tooltip="Every participant in this room, should stake this amount"
                rules={[{ required: true, type: 'number', min: 0.001 }]}>
                <InputNumber prefix="Ξ" />
            </Form.Item>
            <Form.Item name={['hour']}
                rules={[{ required: true }]}
                tooltip="When you want the schedule to be triggered."
                label='Trigger hour'>
                <TimePicker onChange={validateFields} />
            </Form.Item>
            <Form.Item
                name={['daysNumber']}
                label="# of days"
                tooltip={`Minimal period to participate is ${MIN_DAYS} days`}
                rules={[{ required: true, type: 'number', min: 30 }]}>
                <InputNumber />
            </Form.Item>
        </Form>
    )
}

export default ScheduleConfig;