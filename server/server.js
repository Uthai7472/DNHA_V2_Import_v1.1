const cors = require('cors');
const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const csvtojson = require('csvtojson');
const odbc = require('odbc');
const moment = require('moment');

app.use(cors());

const connectionString = "server=SM22626300008\\SQLEXPRESS;Database=DNHACompare;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";
// Create a connection variable at the module level
let connection;

// Function to establish the database connection
function establishConnection() {
  return new Promise((resolve, reject) => {
    odbc.connect(connectionString, (error, conn) => {
      if (error) {
        reject(error);
      } else {
        connection = conn;
        resolve();
      }
    });
  });
}

// Create storage configuration for uploads to ...
const storageSeatLeak = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/SeatLeak');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const storageBody = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Body');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const storageNeedle = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Needle');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Middleware for handling uploads to ...
const uploadSeatLeak = multer({ storage: storageSeatLeak }).array('files', 6);
const uploadBody = multer({ storage: storageBody }).array('files', 6);
const uploadNeedle = multer({ storage: storageNeedle }).array('files', 6);

// Import and convert csv file to JSON
// const jsonResults = [];
// fs.createReadStream('D:\\sdm_240301-240401.csv')
//     .pipe(csv())
//     .on('data', (data) => jsonResults.push({ DateTime: data.DateTime, SeatLeak: data.SeatLeake }))
//     .on('end', () => {
//         console.log(jsonResults);
//     });

app.get('/', (req, res) => {
    res.send('DNHA V2 Import Server Welcome');
});
  

app.post('/upload/seatleak', uploadSeatLeak, (req, res) => {
    res.json({ response: 'seatleak ok'});
    // res.send('Seat leak files uploaded successfully');
});

app.post('/upload/body', uploadBody, (req, res) => {
    res.json({ response: 'body ok'});
    // res.send('Body files uploaded successfully');
});

app.post('/upload/needle', uploadNeedle, (req, res) => {
    res.json({ response: 'needle ok'});
    // res.send('Needle files uploaded successfully');
});

app.post('/processing', async (req, res) => {
    try {
        if (!connection) {
            await establishConnection();
        }

        const seatLeakFiles = await fs.promises.readdir('uploads/SeatLeak');

        // Read files in SeatLeak folder and insert all files to Database
        for (let i = 0; i < seatLeakFiles.length; i++) {

                const seatLeakfile = seatLeakFiles[i];
                const seatLeakJsonArray = await csvtojson().fromFile(`uploads/SeatLeak/${seatLeakfile}`);

                for (const data of seatLeakJsonArray) {
                    const seatVal = parseFloat(data['Measured Value']);
                    let mcName = data['equipment ID'];
                    const partNumber = data['Part number'];
                    const dateTime = data['Processed date/time'];
                    const lotNo = data['Lot No.']; 

                    // Convert DateTime format from 'D/M/YYYY HH:mm:ss' to 'YYYY-MM-DD HH:mm:ss'
                    const modifiedDateTime = moment(dateTime, 'M/D/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');

                    // console.log(modifiedDateTime);
                    if (mcName === 'e15540') {
                        mcName = 'HAMC1';
                    } else if (mcName === 'e15541') {
                        mcName = 'HAMC2';
                    } else if (mcName === 'e15542') {
                        mcName = 'HAMC3';
                    } else if (mcName === 'e15543') {
                        mcName = 'HAMC4';
                    }
                    
                    await new Promise((resolve, reject) => {
                        connection.query(`
                            INSERT INTO tb_SeatStore (DateTime, LotNO, PartNO, SeatVal, MC_Name)
                            VALUES (?, ?, ?, ?, ?)
                        `, [modifiedDateTime, lotNo, partNumber, seatVal, mcName], (error, results) => {
                            if (error) {
                                console.log('Insert Seat Error: ', error);
                                res.json({ status: 'not completed', message: error });
                                reject(error);
                            } else {
                                resolve(results);
                                console.log('Insert SeatLeak');
                            }
                        })
                    });
            }
        }
        console.log('Insert SeatLeak Completed!');

        // Insert all files from Body folder
        const bodyFiles = await fs.promises.readdir('uploads/Body');
        for (let i = 0; i < bodyFiles.length; i++) {
            const bodyFile = bodyFiles[i];
            const bodyJsonArray = await csvtojson().fromFile(`uploads/Body/${bodyFile}`);

            for (const data of bodyJsonArray) {
                const dateTime = data['Processed date/time'];
                const lotNo = data['Lot No.'];
                const bodyLot = data['Measured Value'];

                const modifiedDateTime = moment(dateTime, 'M/D/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                
                // console.log(lotNo);
                // console.log(bodyLot);
                // console.log(modifiedDateTime);
                // console.log(data);
                await new Promise((resolve, reject) => {
                    connection.query(`
                            INSERT INTO tb_BodyStore (DateTime, LotNO, BodyLot)
                            VALUES (?, ?, ?);

                    `, [modifiedDateTime, lotNo, bodyLot], (err, results) => {
                        if (err) {
                            console.log('Insert Body Error: ', err);
                            res.json({ status: 'not completed', message: err });
                            reject(err);
                        } else {
                            console.log('Insert Body');
                            resolve(results);
                        }
                    })
                });
            }
        }
        console.log('Insert Body Completed!');

        // Insert all files from Body folder
        const needleFiles = await fs.promises.readdir('uploads/Needle');
        for (let i = 0; i < needleFiles.length; i++) {
            const needleFile = needleFiles[i];
            const needleJsonArray = await csvtojson().fromFile(`uploads/Needle/${needleFile}`);

            for (const data of needleJsonArray) {
                const dateTime = data['Processed date/time'];
                const lotNo = data['Lot No.'];
                const needleLot = data['Measured Value'];

                const modifiedDateTime = moment(dateTime, 'M/D/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                
                // console.log(lotNo);
                // console.log(bodyLot);
                // console.log(modifiedDateTime);
                // console.log(data);
                await new Promise((resolve, reject) => {
                    connection.query(`
                        INSERT INTO tb_NeedleStore (DateTime, LotNO, NeedleLot)
                        VALUES (?, ?, ?);
                    `, [modifiedDateTime, lotNo, needleLot], (err, results) => {
                        if (err) {
                            console.log('Insert Needle Error: ', err);
                            res.json({ status: 'not completed', message: err });
                            reject(err);
                        } else {
                            console.log('Insert Needle');
                            resolve(results);
                        }
                    })
                });
            }
        }
        console.log('Insert Needle Completed!');

        // Combine Process
        await connection.query(`
            INSERT INTO tb_CombineSeatBodyNeedle (DateTime, LotNO, SeatVal, MC_Name, Body_Lot, PartNO, Needle_Lot)
            SELECT ss.DateTime, ss.LotNO, ss.SeatVal, ss.MC_Name, bds.BodyLot, ss.PartNO, nds.NeedleLot
            FROM tb_SeatStore ss
            INNER JOIN tb_BodyStore bds ON ss.LotNO = bds.LotNO
            INNER JOIN tb_NeedleStore nds ON ss.LotNO = nds.LotNO
            WHERE ss.LotNO NOT IN (SELECT LotNO FROM tb_CombineSeatBodyNeedle);
            
            -- Calculate the average
            WITH avgCal AS (
                SELECT AVG(SeatVal) AS Xbar
                FROM tb_CombineSeatBodyNeedle
            )
            
            UPDATE sbn
            SET Xbar = avgCal.Xbar,
                Xi_sub_Xbar = sbn.SeatVal - avgCal.Xbar
            FROM tb_CombineSeatBodyNeedle sbn
            CROSS JOIN avgCal;
            
            UPDATE sbn
            SET PowerTwo = POWER(sbn.Xi_sub_Xbar, 2)
            FROM tb_CombineSeatBodyNeedle sbn;
            
            
            -- Update the OK_NG and NG_All columns
            UPDATE t
            SET OK_NG =
                CASE
                    WHEN t.SeatVal >= 0.1 OR t.SeatVal < -0.05 THEN 'NG'
                    ELSE 'OK'
                END
            FROM tb_CombineSeatBodyNeedle t;
            
            UPDATE tb_CombineSeatBodyNeedle
            SET NG_All = (SELECT COUNT(*) FROM tb_CombineSeatBodyNeedle
                    WHERE OK_NG = 'NG')
            FROM tb_CombineSeatBodyNeedle;
            
            UPDATE tb_CombineSeatBodyNeedle
            SET NG_MC1 = (SELECT COUNT(*)
                    FROM tb_CombineSeatBodyNeedle
                    WHERE (OK_NG = 'NG') AND (MC_Name = 'HAMC1'))
            FROM tb_CombineSeatBodyNeedle;
            
            UPDATE tb_CombineSeatBodyNeedle
            SET NG_MC2 = (SELECT COUNT(*)
                    FROM tb_CombineSeatBodyNeedle
                    WHERE (OK_NG = 'NG') AND (MC_Name = 'HAMC2'))
            FROM tb_CombineSeatBodyNeedle;
                    
            UPDATE tb_CombineSeatBodyNeedle
            SET NG_MC3 = (SELECT COUNT(*)
                    FROM tb_CombineSeatBodyNeedle
                    WHERE (OK_NG = 'NG') AND (MC_Name = 'HAMC3'))
            FROM tb_CombineSeatBodyNeedle;
            
            UPDATE tb_CombineSeatBodyNeedle
            SET NG_MC4 = (SELECT COUNT(*)
                    FROM tb_CombineSeatBodyNeedle
                    WHERE (OK_NG = 'NG') AND (MC_Name = 'HAMC4'))
            FROM tb_CombineSeatBodyNeedle;
            
            UPDATE tb_CombineSeatBodyNeedle
            SET NeedleDate = LEFT(Needle_Lot, 6),
                NeedlePallet = RIGHT(LEFT(Needle_Lot, 14), 4),
                BodyDate = LEFT(Body_Lot, 6),
                BodyPallet = RIGHT(LEFT(Body_Lot, 14), 4);
                
            UPDATE tb_CombineSeatBodyNeedle
            SET AssyDate = CONCAT(LEFT(LotNO, 2), '/', RIGHT(LEFT(LotNO, 4), 2), '/', YEAR(GETDATE()))
            
            DELETE FROM tb_CombineSeatBodyNeedle
            WHERE NeedlePallet = '000';
            
            UPDATE tb
            SET NeedleMC =
                CASE
                    WHEN tb.NeedlePallet = '0011' THEN 'E0010'
                    WHEN tb.NeedlePallet = '0012' THEN 'E0012'
                    WHEN tb.NeedlePallet = '0013' THEN 'E0013'
                    WHEN tb.NeedlePallet = '0021' THEN 'G0008'
                    WHEN tb.NeedlePallet = '0022' THEN 'G0009'
                    ELSE 'NONE'
                END
            FROM tb_CombineSeatBodyNeedle tb;
            
            UPDATE t
            SET BodyMC =
                CASE
                    WHEN t.BodyPallet = '0001' THEN 'L0001'
                    WHEN t.BodyPallet = '0003' THEN 'L0003'
                    WHEN t.BodyPallet = '0004' THEN 'G0004'
                    WHEN t.BodyPallet = '0005' THEN 'G0005'
                    WHEN t.BodyPallet = '0008' THEN 'E0008'
                    WHEN t.BodyPallet = '0009' THEN 'E0009'
                    ELSE 'NONE'
                END
            FROM tb_CombineSeatBodyNeedle t;
        `, (err, results) => {
            if (err) {
                console.log('Combine failure');
                res.json({ status: 'not completed', message: err });
                // res.json({ status: 'not completed', message: err });
            } else {
                console.log('Combine successfully');
                
            }
        })

        res.json({ status: 'completed' });
        

    } catch (error) {
        console.log(error);
    }
})

app.listen(3000, () => {
    console.log('Server running on port 3000');
});