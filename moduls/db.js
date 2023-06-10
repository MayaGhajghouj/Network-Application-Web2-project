const mysql=require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'center'
  })
connection.connect((err)=>{
    if(!err)
    {
        console.log('connect to mySql database \n\n')
    }
    else{
        console.log('the error is \n'+err.message+'\n')
    }
})

module.exports=connection