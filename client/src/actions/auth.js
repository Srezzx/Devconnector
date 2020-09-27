import axios from 'axios';
import
setAlert
from './alert';

import {
    REGISTER_SUCCESS,
    REGISTER_FAIL
} from './types';

//REGISTER USER
const register = ({
    name,
    email,
    password
}) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({
        name,
        email,
        password
    });
    try {
        const res = await axios.post('/api/users', body, config);
        dispatch({
            type: REGISTER_SUCCESS,
            paload: res.data
        });
    } catch (err) {
        console.log(err);
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: REGISTER_FAIL,
        })
    }
}

export default register;