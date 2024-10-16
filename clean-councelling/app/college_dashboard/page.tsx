import React, { use } from 'react'
import { useUser } from '../context/UserContext'

const College_Dashboard = () => {
    const {user} = useUser();
    if (!user){
        return (
            <p>Loading...</p>
        );
    }
    return (
        <div>
            <p>{user?.college_name}</p>
            <ul>
                <li>{user?.course_name} {}</li>
            </ul>
        </div>
    )
}

export default College_Dashboard