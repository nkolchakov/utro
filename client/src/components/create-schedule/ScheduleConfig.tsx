import { Button, DatePicker, Form, Input, InputNumber } from "antd";
import { CSSProperties } from "react";
import moment from "moment";


const ScheduleConfig = () => {
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
        labelCol: { span: 12 },
        wrapperCol: { span: 12 },
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

    return (
        <Form {...formLayout}
            style={formStyles}
            name="create-room"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            validateMessages={validateMessages}>
            <Form.Item name={['name']}
                label="Room Name"
                rules={[{ required: true },]}>
                <Input />
            </Form.Item>
            <Form.Item name={['maxParticipants']}
                label="Max Participants: "
                rules={[{ required: true, type: 'number', min: 1, max: 10 }]}>
                <InputNumber />
            </Form.Item>
            <Form.Item name={['endDate']}
                label="End date"
                rules={[{ type: 'date', required: true }]}>
                <DatePicker
                    disabledDate={(current) => {
                        let customDate = moment().format("YYYY-MM-DD");
                        return current && current < moment(customDate, "YYYY-MM-DD").add(30, 'days');
                    }} />
            </Form.Item>
        </Form>
    )
}

export default ScheduleConfig;