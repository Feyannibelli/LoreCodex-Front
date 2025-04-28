import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const UserService = {
    getProfile: async (token: string) => {
        const response = await axios.get(`${API_URL}/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};

export default UserService;