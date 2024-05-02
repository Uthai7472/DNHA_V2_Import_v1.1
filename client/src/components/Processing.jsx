import React, { useEffect, useState } from 'react';
import './Processing.css';
import axios from 'axios';
import ClipLoader from "react-spinners/ClipLoader";

// const override: CSSProperties = {
//     display: "block",
//     margin: "0 auto",
//     borderColor: "red",
//   };

const Processing = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleClick = async () => {
        try {
            setLoading(true);

            const response = await axios.post('http://localhost:3000/processing');

            console.log('Response from processing api: ', response.data.status);
            
            if (response.data.status === "completed") {
                alert('DNHA Processing successfully');
                setLoading(false);
                window.location.reload();
            }

        } catch (error) {
            setLoading(false);
            console.log('Error : ', error);
        }
    }



    return (
        <div>
          <div className='processing-container'>
            {!loading ? (
                <>
                <button className='processing-btn' id='processing_btn' onClick={handleClick}>
                    Processing
                </button>
                <label htmlFor="processing_btn" className='processing-btn'>
                    Processing
                </label>
              </>
            ) : (
            <>
                <button className='processing-btn' id='processing_btn'></button>
                <label htmlFor="processing_btn" className='processing-btn-disabled'>
                    <ClipLoader
                    color={'white'} 
                    loading={loading}
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    />
                </label>
            </>
            )}
          </div>
        </div>
      )
    }

export default Processing