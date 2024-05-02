import React, { useState } from 'react';
import './Submit.css';
import axios from 'axios';

const Submit = ({ files, fileIndexes }) => {

    const handleClick = async () => {
        try {
            for (let index = 0; index < files.length; index++) {
                const file = files[index];

                if (file && !isNaN(fileIndexes[index])) {
                    const formData = new FormData();
                    formData.append('files', file);
                    formData.append('index', fileIndexes[index]);

                    if (index >= 1 && index <= 4) {
                        await axios.post('http://localhost:3000/upload/seatleak', formData, {
                            headers: {
                                'Content-type': 'multipart/form-data'
                            }
                        })
                        .then(response => {
                            const responseData = response.data;
                            console.log('Response JSON:', responseData);
                        }).catch(error => {
                            console.log('Error:', error);
                        });

                    } else if (index === 5) {
                        await axios.post('http://localhost:3000/upload/body', formData, {
                            headers: {
                                'Content-type': 'multipart/form-data'
                            }
                        })
                        .then(response => {
                            const responseData = response.data;
                            console.log('Response JSON:', responseData);
                        }).catch(error => {
                            console.log('Error:', error);
                        });

                    } else if (index === 6) {
                        await axios.post('http://localhost:3000/upload/needle', formData, {
                            headers: {
                                'Content-type': 'multipart/form-data'
                            }
                        })
                        .then(response => {
                            const responseData = response.data;
                            console.log('Response JSON:', responseData);
                        }).catch(error => {
                            console.log('Error:', error);
                        });

                    } else {
                        console.log('Error about file index');
                    }
                }
            }
            console.log('Files uploaded successfully');
            window.location.reload();

        } catch (error) {
            console.log(error);
            
        }
    }

  return (
    <div>
        <div className='submit-container'>
            <button className='submit-btn' id='submit_btn' onClick={handleClick}>Submit</button>
            <label htmlFor="submit_btn">Submit</label>
        </div>
    </div>
  )
}

export default Submit