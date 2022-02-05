import { Card } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const ReviewForm = ({ formData }: any) => {



    return (
        <Card title={<h3>{formData.name}</h3>} style={{ width: 300 }}>
            <p>All participants (including you) should stake<strong> Ξ {formData.stake}</strong></p>
            <p>Schedule will be triggered every day at: <strong>{formData.hour.format('LT')}</strong></p>
            <p>and will be completed after: <strong>{formData.daysNumber}</strong></p>
        </Card>
    )
}

export default ReviewForm;