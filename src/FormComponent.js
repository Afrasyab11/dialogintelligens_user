import React from 'react';

export default function FormComponent() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    return (
        <div>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />
        </div>
    );
}

