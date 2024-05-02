import React, { useState } from 'react';
import './UploadForm.css';

const UploadForm = ({ topic, index, onFileChange }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        onFileChange(e.target.files[0], index);
        setSelectedFile(e.target.files[0]);
    }

    const formatFileName = (fileName) => {
        if (fileName.length > 12) {
          const front = fileName.slice(0, 5);
          const back = fileName.slice(-5);
          return `${front}...${back}`;
        }
        return fileName;
    };

  return (
    <div>
        <div className='upload-form'>
            <form action="">
                <div className='form-1'>
                    <h4>{topic} :</h4>
                    {selectedFile && (
                        <div className='filename'>
                            {formatFileName(selectedFile.name)}
                        </div>
                    )}
                    <input type="file" id={`file${index}`} accept='.csv' onChange={handleChange}/>
                    <label htmlFor={`file${index}`}>Upload</label>
                </div>
            </form>
        </div>
    </div>
  )
}

export default UploadForm   