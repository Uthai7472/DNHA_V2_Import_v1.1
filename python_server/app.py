from flask import Flask, render_template, request, render_template_string, jsonify
import pandas as pd
import pyodbc as mssql
import openpyxl
import os
import csv
from datetime import datetime

cursor = None
conn = None

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/processing', methods=['POST'])
def processing():
    try:
        conn = mssql.connect("Driver=ODBC Driver 17 for SQL Server;Server=SM22626300008\SQLEXPRESS;Database=DNHACompare;Trusted_Connection=yes;")
        
        cursor = conn.cursor()
        
        seatFolderPath = "../server/uploads/SeatLeak/"
        seatFiles = os.listdir(seatFolderPath)
        
        for seatFileName in seatFiles:
            if seatFileName.endswith(".csv"):
                seatFilePath = os.path.join(seatFolderPath, seatFileName)
                with open(seatFilePath, 'r', encoding='utf-8') as file:
                    csvData = csv.reader(file)
                    next(csvData)
                    for row in csvData:
                        MC_Name = row[0].split(',')[0]
                        PartNO = row[1].split(',')[0]
                        DateTime = row[2].split(',')[0]
                        LotNO = row[3].split(',')[0]
                        SeatVal = float(row[4].split(',')[0])
                        
                        # Convert DateTime format
                        formatted_datetime = datetime.strptime(DateTime, '%m/%d/%Y %H:%M')
                        formatted_datetime = formatted_datetime.strftime('%d/%m/%Y %H:%M:%S')
                        
                        # Convert MC 
                        if MC_Name == 'e15540':
                            MC_Name = 'HAMC1'
                        elif MC_Name == 'e15541':
                            MC_Name = 'HAMC2'
                        elif MC_Name == 'e15542':
                            MC_Name = 'HAMC3'
                        elif MC_Name == 'e15543':
                            MC_Name = 'HAMC4'
                            
                        cursor.execute(f'''
                                       INSERT INTO tb_SeatStore (DateTime, LotNO, PartNO, SeatVal, MC_Name)
                                       VALUES ('{DateTime}', '{LotNO}', '{PartNO}', {SeatVal}, '{MC_Name}');
                                       ''')
                        cursor.commit()
                        
                        print(f"MC_Name : {MC_Name} DateTime : {SeatVal}")
                        
        return render_template_string(f"<script>alert('Success');</script>")
        
        
    except Exception as e:
        errorMessage = str(e)
        print(errorMessage)
        return render_template_string(f"<script>alert('{errorMessage}');</script>")
    
    

if __name__ == '__main__':
    app.run(debug=True, host="10.116.16.165", port=3001)
        