import React, { useState } from 'react'
import Header from '../components/Header'
import Topic from '../components/Topic'
import UploadForm from '../components/UploadForm'
import './MainImport.css'
import Submit from '../components/Submit'
import Processing from '../components/Processing'

const MainImport = () => {
    const [files, setFiles] = useState([]);
    const [fileIndexes, setFileIndexes] = useState([]);

    const handleFilesChange = (file, index) => {
        const newFiles = [...files];
        const newFileIndexes = [...fileIndexes];

        newFiles[index] = file;
        newFileIndexes[index] = index;

        setFiles(newFiles);
        setFileIndexes(newFileIndexes);

        console.log(`File index ${newFileIndexes[index]} : ${file.name}`)
    }

  return (
    <div>
        <Header />
        <Topic />
        <div className='form-container'>
            <div className='form-partition-1'>
                <UploadForm topic={'Seat Leak HAMC1'} index={1} onFileChange={handleFilesChange} />
                <UploadForm topic={'Seat Leak HAMC2'} index={2} onFileChange={handleFilesChange} />
                <UploadForm topic={'Seat Leak HAMC3'} index={3} onFileChange={handleFilesChange} />
                <UploadForm topic={'Seat Leak HAMC4'} index={4} onFileChange={handleFilesChange} />
            </div>
            <div className='form-partition-2'>
                <UploadForm topic={'Body'} index={5} onFileChange={handleFilesChange} />
            </div>
            <div className='form-partition-3'>
                <UploadForm topic={'Needle'} index={6} onFileChange={handleFilesChange} />
            </div>
        </div>
        <Submit files={files} fileIndexes={fileIndexes} />
        <Processing />
    </div>
  )
}

export default MainImport   