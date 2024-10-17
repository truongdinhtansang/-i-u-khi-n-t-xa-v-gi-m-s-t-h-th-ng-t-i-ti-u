//////////////////////CẤU HÌNH KẾT NỐI KEPWARE////////////////////
const {TagBuilder, IotGateway} = require('kepserverex-js');
const tagBuilder = new TagBuilder({ namespace: 'Channel1.Device1' });
const iotGateway = new IotGateway({
    host: '127.0.0.1',
    port: 5000
});

/////////////HÀM ĐỌC/GHI DỮ LIỆU XUỐNG KEPWARE(PLC)//////////////
//Đọc dữ liệu
var tagArr = [];
function fn_tagRead(){
	iotGateway.read(TagList).then((data)=>{
		var lodash = require('lodash');
		tagArr = lodash.map(data, (item) => item.v);
		console.log(tagArr);
	});
}
// Ghi dữ liệu
function fn_Data_Write(tag,data){
    tagBuilder.clean();
    const set_value = tagBuilder
        .write(tag,data)
        .get();
    iotGateway.write(set_value);
}
// Import các thư viện cần thiết
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require('mysql');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// Khởi tạo ứng dụng Express
const app = express();
const port = 3000; // Bạn có thể thay đổi cổng nếu muốn

// Middleware để xử lý JSON và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Thiết lập static files và view engine
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

// Khởi tạo server và socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Khai báo SQL
const sqlcon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "sql_plc",
  dateStrings:true
});

// Kết nối đến cơ sở dữ liệu
sqlcon.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
        process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
    }
    console.log('Kết nối đến cơ sở dữ liệu thành công!');
});

// Home route
app.get("/", function(req, res){
    res.render("home");
});

// Route để xuất dữ liệu cảnh báo theo khoảng thời gian ra file Excel alarm
app.get('/exportAlarmByTime', (req, res) => {
    // Lấy thời gian từ query string
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    if (!startTime || !endTime) {
        return res.status(400).send("Vui lòng cung cấp thời gian bắt đầu và kết thúc!");
    }

    // Chuyển đổi thời gian sang định dạng MySQL
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // Offset cho múi giờ Việt Nam (GMT+7)
    const timeS = new Date(new Date(startTime) - tzoffset).toISOString().slice(0, 19).replace('T', ' ');
    const timeE = new Date(new Date(endTime) - tzoffset).toISOString().slice(0, 19).replace('T', ' ');
    const timeR = `'${timeS}' AND '${timeE}'`;

    const sqltable_Name = "alarm"; // Tên bảng
    const dt_col_Name = "date_time"; // Tên cột thời gian

    const Query = `SELECT * FROM ${sqltable_Name} WHERE ${dt_col_Name} BETWEEN ${timeR};`;

    // Thực hiện truy vấn
    sqlcon.query(Query, function (err, results, fields) {
        if (err) {
            console.log(err);
            return res.status(500).send("Lỗi khi truy vấn dữ liệu!");
        } else {
            // Chuyển kết quả từ MySQL thành object JSON
            const convertedResponse = results.map(row => ({ ...row }));

            // Tạo WorkBook và WorkSheet
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(convertedResponse);
            xlsx.utils.book_append_sheet(wb, ws, "AlarmDataByTime");

            // Đường dẫn lưu file Excel
            const filePath = path.join(__dirname, 'public', 'Report', 'alarm_data_by_time.xlsx');

            // Kiểm tra và tạo thư mục "Report" nếu chưa tồn tại
            const reportDir = path.join(__dirname, 'public', 'Report');
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true }); // Sử dụng { recursive: true } để tạo các thư mục cha nếu cần
            }

            // Ghi file Excel ra đường dẫn
            xlsx.writeFile(wb, filePath);

            // Gửi file về client để tải xuống
            res.download(filePath, 'alarm_data_by_time.xlsx', function (err) {
                if (err) {
                    console.log("Lỗi khi tải xuống:", err);
                } else {
                    console.log("File đã được tải xuống thành công!");
                }
            });
        }
    });
});

// Route để xuất dữ liệu cảnh báo theo khoảng thời gian ra file Excel active
app.get('/exportActiveByTime', (req, res) => {
  // Lấy thời gian từ query string
  const startTime = req.query.startTime;
  const endTime = req.query.endTime;

  if (!startTime || !endTime) {
      return res.status(400).send("Vui lòng cung cấp thời gian bắt đầu và kết thúc!");
  }

  // Chuyển đổi thời gian sang định dạng MySQL
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; // Offset cho múi giờ Việt Nam (GMT+7)
  const timeS = new Date(new Date(startTime) - tzoffset).toISOString().slice(0, 19).replace('T', ' ');
  const timeE = new Date(new Date(endTime) - tzoffset).toISOString().slice(0, 19).replace('T', ' ');
  const timeR = `'${timeS}' AND '${timeE}'`;

  const sqltable_Name = "active"; // Tên bảng
  const dt_col_Name = "date_time"; // Tên cột thời gian

  const Query = `SELECT * FROM ${sqltable_Name} WHERE ${dt_col_Name} BETWEEN ${timeR};`;

  // Thực hiện truy vấn
  sqlcon.query(Query, function (err, results, fields) {
      if (err) {
          console.log(err);
          return res.status(500).send("Lỗi khi truy vấn dữ liệu!");
      } else {
          // Chuyển kết quả từ MySQL thành object JSON
          const convertedResponse = results.map(row => ({ ...row }));

          // Tạo WorkBook và WorkSheet
          const wb = xlsx.utils.book_new();
          const ws = xlsx.utils.json_to_sheet(convertedResponse);
          xlsx.utils.book_append_sheet(wb, ws, "ActiveDataByTime");

          // Đường dẫn lưu file Excel
          const filePath = path.join(__dirname, 'public', 'Report', 'active_data_by_time.xlsx');

          // Kiểm tra và tạo thư mục "Report" nếu chưa tồn tại
          const reportDir = path.join(__dirname, 'public', 'Report');
          if (!fs.existsSync(reportDir)) {
              fs.mkdirSync(reportDir, { recursive: true }); // Sử dụng { recursive: true } để tạo các thư mục cha nếu cần
          }

          // Ghi file Excel ra đường dẫn
          xlsx.writeFile(wb, filePath);

          // Gửi file về client để tải xuống
          res.download(filePath, 'active_data_by_time.xlsx', function (err) {
              if (err) {
                  console.log("Lỗi khi tải xuống:", err);
              } else {
                  console.log("File đã được tải xuống thành công!");
              }
          });
      }
  });
});


// Khởi động server với socket.io
server.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});

///////////////////////////ĐỊNH NGHĨA TAG////////////////////////
// Khai báo tag
var Start1  		                    = 'Start1';
var Start2 	                            = 'Start2';
var Start3		                        = 'Start3';
var Start4 		                        = 'Start4';
var Start5 		                        = 'Start5';
var Start6 		                        = 'Start6';
var Start7 		                        = 'Start7';
var Start8		                        = 'Start8';
var Start9 		                        = 'Start9';
var Start10 		                    = 'Start10';
var Stop1 		                        = 'Stop1';
var Stop2 		                        = 'Stop2';
var Stop3 		                        = 'Stop3';
var Stop4 		                        = 'Stop4';
var Stop5 		                        = 'Stop5';
var Stop6 		                        = 'Stop6';
var Stop7 		                        = 'Stop7';
var Stop8 		                        = 'Stop8';
var Stop9 		                        = 'Stop9';
var Stop10 		                        = 'Stop10';
var kichbientan1chaymay1 		        = 'kichbientan1chaymay1';
var kichbientan2chaymay2		        = 'kichbientan2chaymay2';
var kichbientan3chaymay3 		        = 'kichbientan3chaymay3';
var kichbientan4chaymay4 		        = 'kichbientan4chaymay4';
var kichbientan5chaymay5 		        = 'kichbientan5chaymay5';
var kichbientan6chaymay6 		        = 'kichbientan6chaymay6';
var kichbientan7chaymay7 		        = 'kichbientan7chaymay7';
var kichbientan8chaymay8 		        = 'kichbientan8chaymay8';
var kichbientan9chaymay9 		        = 'kichbientan9chaymay9';
var kichbientan10chaymay10 		        = 'kichbientan10chaymay10';
var chedobantay                         = 'chedobantay';
var StopALL                             = 'StopALL';
var Reset                               = 'Reset';
var denbaoapsuat                        = 'denbaoapsuat';
var thoigianbom1chaygio                 = 'thoigianbom1chaygio';
var thoigianbom2chaygio                 = 'thoigianbom2chaygio';
var thoigianbom3chaygio                 = 'thoigianbom3chaygio';
var thoigianbom4chaygio                 = 'thoigianbom4chaygio';
var thoigianbom5chaygio                 = 'thoigianbom5chaygio';
var thoigianbom6chaygio                 = 'thoigianbom6chaygio';
var thoigianbom7chaygio                 = 'thoigianbom7chaygio';
var thoigianbom8chaygio                 = 'thoigianbom8chaygio';
var thoigianbom9chaygio                 = 'thoigianbom9chaygio';
var thoigianbom10chaygio                = 'thoigianbom10chaygio';
var tongthoigiantinhtheogio             = 'tongthoigiantinhtheogio';
var relaynhiet1                         = 'relaynhiet1';
var relaynhiet2                         = 'relaynhiet2';
var relaynhiet3                         = 'relaynhiet3';
var relaynhiet4                         = 'relaynhiet4';
var relaynhiet5                         = 'relaynhiet5';
var relaynhiet6                         = 'relaynhiet6';
var relaynhiet7                         = 'relaynhiet7';
var relaynhiet8                         = 'relaynhiet8';
var relaynhiet9                         = 'relaynhiet9';
var relaynhiet10                        = 'relaynhiet10';
var denbaoquanhiettong                  = 'denbaoquanhiettong';
var Alam1_bit8_mb1quanhiet              = 'Alam1_bit8_mb1quanhiet';
var Alam1_bit9_mb2quanhiet              = 'Alam1_bit9_mb2quanhiet';
var Alam1_bit10_mb3quanhiet             = 'Alam1_bit10_mb3quanhiet';
var Alam1_bit11_mb4quanhiet             = 'Alam1_bit11_mb4quanhiet';
var Alam1_bit12_mb5quanhiet             = 'Alam1_bit12_mb5quanhiet';
var Alam1_bit13_mb6quanhiet             = 'Alam1_bit13_mb6quanhiet';
var Alam1_bit14_mb7quanhiet             = 'Alam1_bit14_mb7quanhiet';
var Alam1_bit15_mb8quanhiet             = 'Alam1_bit15_mb8quanhiet';
var Alam1_bit0_mb9quanhiet              = 'Alam1_bit0_mb9quanhiet';
var Alam1_bit1_mb10quanhiet             = 'Alam1_bit1_mb10quanhiet';
var SP_tanso1                           = 'SP_tanso1';
var SP_tanso2                           = 'SP_tanso2';
var SP_tanso3                           = 'SP_tanso3';
var SP_tanso4                           = 'SP_tanso4';
var SP_tanso5                           = 'SP_tanso5';
var SP_tanso6                           = 'SP_tanso6';
var SP_tanso7                           = 'SP_tanso7';
var SP_tanso8                           = 'SP_tanso8';
var SP_tanso9                           = 'SP_tanso9';
var SP_tanso10                          = 'SP_tanso10';

var chedoauto                          = 'chedoauto';
var StartAuto                          = 'StartAuto';
var nutnhanauto                          = 'nutnhanauto';
var nutnhanbangtay                          = 'nutnhanbangtay';
var luongnuocbom1                          = 'luongnuocbom1';
var luongnuocbom2                          = 'luongnuocbom2';
var luongnuocbom3                          = 'luongnuocbom3';
var luongnuocbom4                         = 'luongnuocbom4';
var luongnuocbom5                          = 'luongnuocbom5';
var luongnuocbom6                          = 'luongnuocbom6';
var luongnuocbom7                          = 'luongnuocbom7';
var luongnuocbom8                          = 'luongnuocbom8';
var luongnuocbom9                          = 'luongnuocbom9';
var luongnuocbom10                          = 'luongnuocbom10';
var tongluongnuocbom                          = 'tongluongnuocbom';
var mucnuocyeucau                          = 'mucnuocyeucau';
var denbaomucnuocday                          = 'denbaomucnuocday';




// Đọc dữ liệu
const TagList = tagBuilder
.read(Start1)
.read(Start2)
.read(Start3)
.read(Start4)
.read(Start5)
.read(Start6)
.read(Start7)
.read(Start8)
.read(Start9)
.read(Start10)
.read(Stop1)
.read(Stop2)
.read(Stop3)
.read(Stop4)
.read(Stop5)
.read(Stop6)
.read(Stop7)
.read(Stop8)
.read(Stop9)
.read(Stop10)
.read(kichbientan1chaymay1)
.read(kichbientan2chaymay2)
.read(kichbientan3chaymay3)
.read(kichbientan4chaymay4)
.read(kichbientan5chaymay5)
.read(kichbientan6chaymay6)
.read(kichbientan7chaymay7)
.read(kichbientan8chaymay8)
.read(kichbientan9chaymay9)
.read(kichbientan10chaymay10)
.read(chedobantay)
.read(StopALL)
.read(Reset)
.read(denbaoapsuat)
.read(thoigianbom1chaygio)
.read(thoigianbom2chaygio)
.read(thoigianbom3chaygio)
.read(thoigianbom4chaygio)
.read(thoigianbom5chaygio)
.read(thoigianbom6chaygio)
.read(thoigianbom7chaygio)
.read(thoigianbom8chaygio)
.read(thoigianbom9chaygio)
.read(thoigianbom10chaygio)
.read(tongthoigiantinhtheogio)
.read(relaynhiet1)
.read(relaynhiet2)
.read(relaynhiet3)
.read(relaynhiet4)
.read(relaynhiet5)
.read(relaynhiet6)
.read(relaynhiet7)
.read(relaynhiet8)
.read(relaynhiet9)
.read(relaynhiet10)
.read(denbaoquanhiettong)
.read(Alam1_bit8_mb1quanhiet)
.read(Alam1_bit9_mb2quanhiet)
.read(Alam1_bit10_mb3quanhiet)
.read(Alam1_bit11_mb4quanhiet)
.read(Alam1_bit12_mb5quanhiet)
.read(Alam1_bit13_mb6quanhiet)
.read(Alam1_bit14_mb7quanhiet)
.read(Alam1_bit15_mb8quanhiet)
.read(Alam1_bit0_mb9quanhiet)
.read(Alam1_bit1_mb10quanhiet)
.read(SP_tanso1)
.read(SP_tanso2)
.read(SP_tanso3)
.read(SP_tanso4)
.read(SP_tanso5)
.read(SP_tanso6)
.read(SP_tanso7)
.read(SP_tanso8)
.read(SP_tanso9)
.read(SP_tanso10)

.read(chedoauto)
.read(StartAuto)
.read(nutnhanauto)
.read(nutnhanbangtay)
.read(luongnuocbom1)
.read(luongnuocbom2)
.read(luongnuocbom3)
.read(luongnuocbom4)
.read(luongnuocbom5)
.read(luongnuocbom6)
.read(luongnuocbom7)
.read(luongnuocbom8)
.read(luongnuocbom9)
.read(luongnuocbom10)
.read(tongluongnuocbom)
.read(mucnuocyeucau)
.read(denbaomucnuocday)



.get();



/////////////////////////////////QUÉT DỮ LIỆU//////////////////////////
// Tạo Timer quét dữ liệu
setInterval(
  () => fn_read_data_scan(),
  1000 //100ms = 1s
);
// Quét dữ liệu
function fn_read_data_scan(){
  fn_tagRead();   // Đọc giá trị tag
 
  fn_Alarm_Manage(); // Cảnh báo
  fn_Active_Manage(); // active
}



// ///////////LẬP BẢNG TAG ĐỂ GỬI QUA CLIENT (TRÌNH DUYỆT)///////////
function fn_tag(){
    io.sockets.emit("Start1", tagArr[0]);
    io.sockets.emit("Start2", tagArr[1]);
    io.sockets.emit("Start3", tagArr[2]);
    io.sockets.emit("Start4", tagArr[3]);
    io.sockets.emit("Start5", tagArr[4]);
    io.sockets.emit("Start6", tagArr[5]);
    io.sockets.emit("Start7", tagArr[6]);
    io.sockets.emit("Start8", tagArr[7]);
    io.sockets.emit("Start9", tagArr[8]);
    io.sockets.emit("Start10", tagArr[9]);
    io.sockets.emit("Stop1", tagArr[10]);
    io.sockets.emit("Stop2", tagArr[11]);
    io.sockets.emit("Stop3", tagArr[12]);
    io.sockets.emit("Stop4", tagArr[13]);
    io.sockets.emit("Stop5", tagArr[14]);
    io.sockets.emit("Stop6", tagArr[15]);
    io.sockets.emit("Stop7", tagArr[16]);
    io.sockets.emit("Stop8", tagArr[17]);
    io.sockets.emit("Stop9", tagArr[18]);
    io.sockets.emit("Stop10", tagArr[19]);
    io.sockets.emit("kichbientan1chaymay1", tagArr[20]);
    io.sockets.emit("kichbientan2chaymay2", tagArr[21]);
    io.sockets.emit("kichbientan3chaymay3", tagArr[22]);
    io.sockets.emit("kichbientan4chaymay4", tagArr[23]);
    io.sockets.emit("kichbientan5chaymay5", tagArr[24]);
    io.sockets.emit("kichbientan6chaymay6", tagArr[25]);
    io.sockets.emit("kichbientan7chaymay7", tagArr[26]);
    io.sockets.emit("kichbientan8chaymay8", tagArr[27]);
    io.sockets.emit("kichbientan9chaymay9", tagArr[28]);
    io.sockets.emit("kichbientan10chaymay10", tagArr[29]);
    io.sockets.emit("chedobantay", tagArr[30]);
    io.sockets.emit("StopALL", tagArr[31]);
    io.sockets.emit("Reset", tagArr[32]);
    io.sockets.emit("denbaoapsuat", tagArr[33]);
    io.sockets.emit("thoigianbom1chaygio", tagArr[34]);
    io.sockets.emit("thoigianbom2chaygio", tagArr[35]);
    io.sockets.emit("thoigianbom3chaygio", tagArr[36]);
    io.sockets.emit("thoigianbom4chaygio", tagArr[37]);
    io.sockets.emit("thoigianbom5chaygio", tagArr[38]);
    io.sockets.emit("thoigianbom6chaygio", tagArr[39]);
    io.sockets.emit("thoigianbom7chaygio", tagArr[40]);
    io.sockets.emit("thoigianbom8chaygio", tagArr[41]);
    io.sockets.emit("thoigianbom9chaygio", tagArr[42]);
    io.sockets.emit("thoigianbom10chaygio", tagArr[43]);
    io.sockets.emit("tongthoigiantinhtheogio", tagArr[44]);
    io.sockets.emit("relaynhiet1", tagArr[45]);
    io.sockets.emit("relaynhiet2", tagArr[46]);
    io.sockets.emit("relaynhiet3", tagArr[47]);
    io.sockets.emit("relaynhiet4", tagArr[48]);
    io.sockets.emit("relaynhiet5", tagArr[49]);
    io.sockets.emit("relaynhiet6", tagArr[50]);
    io.sockets.emit("relaynhiet7", tagArr[51]);
    io.sockets.emit("relaynhiet8", tagArr[52]);
    io.sockets.emit("relaynhiet9", tagArr[53]);
    io.sockets.emit("relaynhiet10", tagArr[54]);
    io.sockets.emit("denbaoquanhiettong", tagArr[55]);
    io.sockets.emit("Alam1_bit8_mb1quanhiet", tagArr[56]);
    io.sockets.emit("Alam1_bit9_mb2quanhiet", tagArr[57]);
    io.sockets.emit("Alam1_bit10_mb3quanhiet", tagArr[58]);
    io.sockets.emit("Alam1_bit11_mb4quanhiet", tagArr[59]);
    io.sockets.emit("Alam1_bit12_mb5quanhiet", tagArr[60]);
    io.sockets.emit("Alam1_bit13_mb6quanhiet", tagArr[61]);
    io.sockets.emit("Alam1_bit14_mb7quanhiet", tagArr[62]);
    io.sockets.emit("Alam1_bit15_mb8quanhiet", tagArr[63]);
    io.sockets.emit("Alam1_bit0_mb9quanhiet", tagArr[64]);
    io.sockets.emit("Alam1_bit1_mb10quanhiet", tagArr[65]);
    io.sockets.emit("SP_tanso1", tagArr[66]);
    io.sockets.emit("SP_tanso2", tagArr[67]);
    io.sockets.emit("SP_tanso3", tagArr[68]);
    io.sockets.emit("SP_tanso4", tagArr[69]);
    io.sockets.emit("SP_tanso5", tagArr[70]);
    io.sockets.emit("SP_tanso6", tagArr[71]);
    io.sockets.emit("SP_tanso7", tagArr[72]);
    io.sockets.emit("SP_tanso8", tagArr[73]);
    io.sockets.emit("SP_tanso9", tagArr[74]);
    io.sockets.emit("SP_tanso10", tagArr[75]);

    io.sockets.emit("chedoauto", tagArr[76]);
    io.sockets.emit("StartAuto", tagArr[77]);
    io.sockets.emit("nutnhanauto", tagArr[78]);
    io.sockets.emit("nutnhanbangtay", tagArr[79]);
    io.sockets.emit("luongnuocbom1", tagArr[80]);
    io.sockets.emit("luongnuocbom2", tagArr[81]);
    io.sockets.emit("luongnuocbom3", tagArr[82]);
    io.sockets.emit("luongnuocbom4", tagArr[83]);
    io.sockets.emit("luongnuocbom5", tagArr[84]);
    io.sockets.emit("luongnuocbom6", tagArr[85]);
    io.sockets.emit("luongnuocbom7", tagArr[86]);
    io.sockets.emit("luongnuocbom8", tagArr[87]);
    io.sockets.emit("luongnuocbom9", tagArr[88]);
    io.sockets.emit("luongnuocbom10", tagArr[89]);
    io.sockets.emit("tongluongnuocbom", tagArr[90]);
    io.sockets.emit("mucnuocyeucau", tagArr[91]);
    io.sockets.emit("denbaomucnuocday", tagArr[92]);
    

    
}
// ///////////GỬI DỮ LIỆU BẢNG TAG ĐẾN CLIENT (TRÌNH DUYỆT)///////////
io.on("connection", function(socket){
    socket.on("Client-send-data", function(data){
    fn_tag();
});});


// ///////////TRUYỀN NHẬN DỮ LIỆU VỚI TRÌNH DUYỆT WEB///////////////////
io.on("connection", function(socket){
   // Chế độ auto
   socket.on("cmd_Auto", function(data){
    fn_Data_Write(nutnhanauto,data);
    });
    // Stop man
socket.on("cmd_Man", function(data){
    fn_Data_Write(nutnhanbangtay,data);
    });
    // Stop ALL
    socket.on("cmd_StopALL", function(data){
		fn_Data_Write(StopALL,data);
	});
     // Reset
     socket.on("cmd_Reset", function(data){
		fn_Data_Write(Reset,data);
	});
    // Start1
    socket.on("cmd_Start1", function(data){
		fn_Data_Write(Start1,data);
	});
    // Start2
    socket.on("cmd_Start2", function(data){
		fn_Data_Write(Start2,data);
	});
    // Start3
    socket.on("cmd_Start3", function(data){
		fn_Data_Write(Start3,data);
	});
    // Start4
    socket.on("cmd_Start4", function(data){
		fn_Data_Write(Start4,data);
	});
    // Start5
    socket.on("cmd_Start5", function(data){
		fn_Data_Write(Start5,data);
	});
    // Start6
    socket.on("cmd_Start6", function(data){
		fn_Data_Write(Start6,data);
	});
    // Start7
    socket.on("cmd_Start7", function(data){
		fn_Data_Write(Start7,data);
	});
    // Start8
    socket.on("cmd_Start8", function(data){
		fn_Data_Write(Start8,data);
	});
    // Start9
    socket.on("cmd_Start9", function(data){
		fn_Data_Write(Start9,data);
	});
    // Start10
    socket.on("cmd_Start10", function(data){
		fn_Data_Write(Start10,data);
	});
    // Stop1
    socket.on("cmd_Stop1", function(data){
		fn_Data_Write(Stop1,data);
	});
    // Stop2
    socket.on("cmd_Stop2", function(data){
		fn_Data_Write(Stop2,data);
	});
    // Stop3
    socket.on("cmd_Stop3", function(data){
		fn_Data_Write(Stop3,data);
	});
    // Stop4
    socket.on("cmd_Stop4", function(data){
		fn_Data_Write(Stop4,data);
	});
    // Stop5
    socket.on("cmd_Stop5", function(data){
		fn_Data_Write(Stop5,data);
	});
    // Stop6
    socket.on("cmd_Stop6", function(data){
		fn_Data_Write(Stop6,data);
	});
    // Stop7
    socket.on("cmd_Stop7", function(data){
		fn_Data_Write(Stop7,data);
	});
    // Stop8
    socket.on("cmd_Stop8", function(data){
		fn_Data_Write(Stop8,data);
	});
    // Stop9
    socket.on("cmd_Stop9", function(data){
		fn_Data_Write(Stop9,data);
	});
    // Stop10
    socket.on("cmd_Stop10", function(data){
		fn_Data_Write(Stop10,data);
	});
    // Start Auto
    socket.on("cmd_StartAuto", function(data){
		fn_Data_Write(StartAuto,data);
	});
    // Stop all auto
    socket.on("cmd_StopALLauto", function(data){
		fn_Data_Write(StopALL,data);
	});
  // reset auto
  socket.on("cmd_ResetAuto", function(data){
		fn_Data_Write(Reset,data);
	});
});


// ++++++++++++++++++++++++++GHI DỮ LIỆU XUỐNG PLC+++++++++++++++++++++++++++
// MÀN HÌNH MAN
io.on("connection", function(socket)
{
    socket.on("cmd_Man_Edit_Data", function(data){
        fn_Data_Write(SP_tanso1,data[0]);
        fn_Data_Write(SP_tanso2,data[1]);
        fn_Data_Write(SP_tanso3,data[2]);
        fn_Data_Write(SP_tanso4,data[3]);
        fn_Data_Write(SP_tanso5,data[4]);
        fn_Data_Write(SP_tanso6,data[5]);
        fn_Data_Write(SP_tanso7,data[6]);
        fn_Data_Write(SP_tanso8,data[7]);
        fn_Data_Write(SP_tanso9,data[8]);
        fn_Data_Write(SP_tanso10,data[9]);
        
      
    });
});


// MÀN HÌNH 1
io.on("connection", function(socket)
{
    socket.on("cmd_Auto_Edit_Data", function(data){
        fn_Data_Write(mucnuocyeucau,data[0]);
    });
});






// /////////////////////////////// CẢNH BÁO ///////////////////////////////
// Hàm thêm cảnh báo mới
function fn_sql_alarm_insert(ID, AlarmName){
  var sqltable_Name = "alarm";
  // Lấy thời gian hiện tại
  var tzoffset = (new Date()).getTimezoneOffset() * 60000; // Vùng Việt Nam (GMT7+)
  var temp_datenow = new Date();
var timeNow = (new Date(temp_datenow - tzoffset)).toISOString().slice(0, -1).replace("T"," ");
  var timeNow_toSQL = "'" + timeNow + "',";

  // Dữ liệu trạng thái báo cáo
  var data_1 = "'" + ID + "',";
  var data_2 = "'I',";
  var data_3 = "'" + AlarmName + "'";
  // Thêm cảnh báo vào SQL
  var str1 = "INSERT INTO " + sqltable_Name + " (date_time, ID, Status, AlarmName) VALUES (";
  var str2 = timeNow_toSQL
              + data_1
              + data_2
              + data_3
              ;
  var str = str1 + str2 + ");";
  // Ghi dữ liệu cảnh báo vào SQL
  sqlcon.query(str, function (err, result) {
      if (err) {console.log(err);} else {}
  });
}


// Hàm tự động xác nhận cảnh báo
function fn_sql_alarm_ack(ID){
  var sqltable_Name = "alarm";

  // Dữ liệu trạng thái cảnh báo
  var data_1 = " Status = 'IO'";

  var str1 = "UPDATE " + sqltable_Name + " SET";
  var str2 = " WHERE ID='" + ID + "'";

  var str = str1 + data_1 + str2 + ";";
  // Ghi dữ liệu cảnh báo vào SQL
  sqlcon.query(str, function (err, result) {
      if (err) {console.log(err);} else {}
  });
}


// Tạo biến báo đã ghi xong cảnh báo vào SQL
var Alarm_ID1_aldone = false;
var Alarm_ID2_aldone = false;
var Alarm_ID3_aldone = false;
var Alarm_ID4_aldone = false;
var Alarm_ID5_aldone = false;
var Alarm_ID6_aldone = false;
var Alarm_ID7_aldone = false;
var Alarm_ID8_aldone = false;
var Alarm_ID9_aldone = false;
var Alarm_ID10_aldone = false;
// Hàm chức năng insert Alarm // sử dụng cho 3 cảnh báo
function fn_Alarm_Manage(){
    var Alarm_ID1 = tagArr[56];      // Quét trigger alarm ID1
    var Alarm_ID2 = tagArr[57];      // Quét trigger alarm ID2
    var Alarm_ID3 = tagArr[58];      // Quét trigger alarm ID3
    var Alarm_ID4 = tagArr[59]; 
    var Alarm_ID5 = tagArr[60]; 
    var Alarm_ID6 = tagArr[61]; 
    var Alarm_ID7 = tagArr[62]; 
    var Alarm_ID8 = tagArr[63]; 
    var Alarm_ID9 = tagArr[64]; 
    var Alarm_ID10 = tagArr[65]; 
    // Cảnh báo động cơ 1
    if(Alarm_ID1 == true & Alarm_ID1 != Alarm_ID1_aldone){
        fn_sql_alarm_insert(1, "Động cơ 1 lỗi")
    } if(Alarm_ID1 == false & Alarm_ID1 != Alarm_ID1_aldone) {
        fn_sql_alarm_ack(1);
    }
    Alarm_ID1_aldone = Alarm_ID1;
    // Cảnh báo động cơ 2
    if(Alarm_ID2 == true & Alarm_ID2 != Alarm_ID2_aldone){
        fn_sql_alarm_insert(2, "Động cơ 2 lỗi")
    } if(Alarm_ID2 == false & Alarm_ID2 != Alarm_ID2_aldone) {
        fn_sql_alarm_ack(2);
    }
    Alarm_ID2_aldone = Alarm_ID2;
    // Cảnh báo động cơ 3
    if(Alarm_ID3 == true & Alarm_ID3 != Alarm_ID3_aldone){
        fn_sql_alarm_insert(3, "Động cơ 3 lỗi")
    } if(Alarm_ID3 == false & Alarm_ID3 != Alarm_ID3_aldone) {
        fn_sql_alarm_ack(3);
    }
    Alarm_ID3_aldone = Alarm_ID3;
    // Cảnh báo động cơ 4
    if(Alarm_ID4 == true & Alarm_ID4 != Alarm_ID4_aldone){
      fn_sql_alarm_insert(4, "Động cơ 4 lỗi")
  } if(Alarm_ID4 == false & Alarm_ID4 != Alarm_ID4_aldone) {
      fn_sql_alarm_ack(4);
  }
  Alarm_ID4_aldone = Alarm_ID4;
  // Cảnh báo động cơ 5
  if(Alarm_ID5 == true & Alarm_ID5 != Alarm_ID5_aldone){
    fn_sql_alarm_insert(5, "Động cơ 5 lỗi")
} if(Alarm_ID5 == false & Alarm_ID5 != Alarm_ID5_aldone) {
    fn_sql_alarm_ack(5);
  }
  Alarm_ID5_aldone = Alarm_ID5;
  // Cảnh báo động cơ 6
  if(Alarm_ID6 == true & Alarm_ID6 != Alarm_ID6_aldone){
    fn_sql_alarm_insert(6, "Động cơ 6 lỗi")
  } if(Alarm_ID6 == false & Alarm_ID6 != Alarm_ID6_aldone) {
    fn_sql_alarm_ack(6);
  }
  Alarm_ID6_aldone = Alarm_ID6;
  // Cảnh báo động cơ 6
  if(Alarm_ID7 == true & Alarm_ID7 != Alarm_ID7_aldone){
    fn_sql_alarm_insert(7, "Động cơ 7 lỗi")
  } if(Alarm_ID7 == false & Alarm_ID7 != Alarm_ID7_aldone) {
    fn_sql_alarm_ack(7);
  }
  Alarm_ID7_aldone = Alarm_ID7;
  // Cảnh báo động cơ 8
  if(Alarm_ID8 == true & Alarm_ID8 != Alarm_ID8_aldone){
    fn_sql_alarm_insert(8, "Động cơ 8 lỗi")
  } if(Alarm_ID8 == false & Alarm_ID8 != Alarm_ID8_aldone) {
    fn_sql_alarm_ack(8);
  }
  Alarm_ID8_aldone = Alarm_ID8;
  // Cảnh báo động cơ 9
  if(Alarm_ID9 == true & Alarm_ID9 != Alarm_ID9_aldone){
    fn_sql_alarm_insert(9, "Động cơ 9 lỗi")
  } if(Alarm_ID9 == false & Alarm_ID9 != Alarm_ID9_aldone) {
    fn_sql_alarm_ack(9);
  }
  Alarm_ID9_aldone = Alarm_ID9;
  // Cảnh báo động cơ 10
  if(Alarm_ID10 == true & Alarm_ID10 != Alarm_ID10_aldone){
    fn_sql_alarm_insert(10, "Động cơ 10 lỗi")
  } if(Alarm_ID10 == false & Alarm_ID10 != Alarm_ID10_aldone) {
    fn_sql_alarm_ack(10);
  }
  Alarm_ID10_aldone = Alarm_ID10;
}





// Đọc thị dữ liệu Cảnh báo
io.on("connection", function(socket){
  socket.on("msg_Alarm_Show", function(data)
  {
      var sqltable_Name = "alarm";
      var query = "SELECT * FROM " + sqltable_Name + " WHERE Status = 'I';"; 
      sqlcon.query(query, function(err, results, fields) {
          if (err) {
              console.log(err);
          } else {
              const objectifyRawPacket = row => ({...row});
              const convertedResponse = results.map(objectifyRawPacket);
              socket.emit('Alarm_Show', convertedResponse);
          } 
      });
  });
});

/*
// Tìm kiếm báo cáo theo khoảng thời gian
io.on("connection", function(socket){
  socket.on("msg_Alarm_ByTime", function(data)
  {
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset time Việt Nam (GMT7+)
      // Lấy thời gian tìm kiếm từ date time piker
      var timeS = new Date(data[0]); // Thời gian bắt đầu
      var timeE = new Date(data[1]); // Thời gian kết thúc
      // Quy đổi thời gian ra định dạng cua MySQL
      var timeS1 = "'" + (new Date(timeS - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeE1 = "'" + (new Date(timeE - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeR = timeS1 + " AND " + timeE1; // Thêm dấu cách xung quanh "AND" // Khoảng thời gian tìm kiếm (Time Range)

      var sqltable_Name = "alarm"; // Tên bảng
      var dt_col_Name = "date_time";  // Tên cột thời gian

      var Query1 = "SELECT * FROM " + sqltable_Name + " WHERE " + dt_col_Name + " BETWEEN ";
      var Query = Query1 + timeR + ";";

      sqlcon.query(Query, function(err, results, fields) {
          if (err) {
              console.log(err);
          } else {
              const objectifyRawPacket = row => ({...row});
              const convertedResponse = results.map(objectifyRawPacket);
              socket.emit('Alarm_ByTime', convertedResponse);
          }
      });
  });
});
*/

// Tìm kiếm báo cáo theo khoảng thời gian
io.on("connection", function(socket){
  socket.on("msg_Alarm_ByTime", function(data)
  {
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset time Việt Nam (GMT7+)
      // Lấy thời gian tìm kiếm từ date time piker
      var timeS = new Date(data[0]); // Thời gian bắt đầu
      var timeE = new Date(data[1]); // Thời gian kết thúc
      // Quy đổi thời gian ra định dạng cua MySQL
      var timeS1 = "'" + (new Date(timeS - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeE1 = "'" + (new Date(timeE - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeR = timeS1 + " AND " + timeE1; // Thêm dấu cách xung quanh "AND" // Khoảng thời gian tìm kiếm (Time Range)

      var sqltable_Name = "alarm"; // Tên bảng
      var dt_col_Name = "date_time";  // Tên cột thời gian

      var Query1 = "SELECT * FROM " + sqltable_Name + " WHERE " + dt_col_Name + " BETWEEN ";
      var Query = Query1 + timeR + ";";

      sqlcon.query(Query, function(err, results, fields) {
          if (err) {
              console.log(err);
          } else {
              const objectifyRawPacket = row => ({...row});
              const convertedResponse = results.map(objectifyRawPacket);
              socket.emit('Alarm_ByTime', convertedResponse);
          }
      });
  });
});


// /////////////////////////////// TRẠNG THÁI ACTIVE ///////////////////////////////
// Hàm thêm Active mới
function fn_sql_Active_insert(ID, ActiveName){
  var sqltable_Name = "active";
  // Lấy thời gian hiện tại
  var tzoffset = (new Date()).getTimezoneOffset() * 60000; // Vùng Việt Nam (GMT7+)
  var temp_datenow = new Date();
var timeNow = (new Date(temp_datenow - tzoffset)).toISOString().slice(0, -1).replace("T"," ");
  var timeNow_toSQL = "'" + timeNow + "',";

  // Dữ liệu trạng thái báo cáo
  var data_1 = "'" + ID + "',";
  var data_2 = "'I',";
  var data_3 = "'" + ActiveName + "'";
  // Thêm Active vào SQL
  var str1 = "INSERT INTO " + sqltable_Name + " (date_time, ID, Status, ActiveName) VALUES (";
  var str2 = timeNow_toSQL
              + data_1
              + data_2
              + data_3
              ;
  var str = str1 + str2 + ");";
  // Ghi dữ liệu Active vào SQL
  sqlcon.query(str, function (err, result) {
      if (err) {console.log(err);} else {}
  });
}


// Hàm tự động xác nhận Active
function fn_sql_Active_ack(ID){
  var sqltable_Name = "active";

  // Dữ liệu trạng thái Active
  var data_1 = " Status = 'IO'";

  var str1 = "UPDATE " + sqltable_Name + " SET";
  var str2 = " WHERE ID='" + ID + "'";

  var str = str1 + data_1 + str2 + ";";
  // Ghi dữ liệu Active vào SQL
  sqlcon.query(str, function (err, result) {
      if (err) {console.log(err);} else {}
  });
}
// Hàm tự động xác nhận Active
function fn_sql_Active_ack(ID){
  var sqltable_Name = "active";

  // Dữ liệu trạng thái Active
  var data_1 = " Status = 'IO'";

  var str1 = "UPDATE " + sqltable_Name + " SET";
  var str2 = " WHERE ID='" + ID + "'";

  var str = str1 + data_1 + str2 + ";";
  // Ghi dữ liệu Active vào SQL
  sqlcon.query(str, function (err, result) {
      if (err) {console.log(err);} else {}
  });
}
// Tạo biến báo đã ghi xong Active vào SQL
var Active_ID1_aldone = false;
var Active_ID2_aldone = false;
var Active_ID3_aldone = false;
var Active_ID4_aldone = false;
var Active_ID5_aldone = false;
var Active_ID6_aldone = false;
var Active_ID7_aldone = false;
var Active_ID8_aldone = false;
var Active_ID9_aldone = false;
var Active_ID10_aldone = false;
// Hàm chức năng insert Alarm // sử dụng cho 3 Active
function fn_Active_Manage(){
    var Active_ID1 = tagArr[20];      // Quét trigger active ID1
    var Active_ID2 = tagArr[21];      // Quét trigger active ID2
    var Active_ID3 = tagArr[22];      // Quét trigger active ID3
    var Active_ID4 = tagArr[23]; 
    var Active_ID5 = tagArr[24]; 
    var Active_ID6 = tagArr[25]; 
    var Active_ID7 = tagArr[26]; 
    var Active_ID8 = tagArr[27]; 
    var Active_ID9 = tagArr[28]; 
    var Active_ID10 = tagArr[29]; 
    // Active động cơ 1
    if(Active_ID1 == true & Active_ID1 != Active_ID1_aldone){
        fn_sql_Active_insert(1, "Động cơ 1 hoạt động")
    } if(Active_ID1 == false & Active_ID1 != Active_ID1_aldone) {
        fn_sql_Active_ack(1);
    }
    Active_ID1_aldone = Active_ID1;
    // Active động cơ 2
    if(Active_ID2 == true & Active_ID2 != Active_ID2_aldone){
        fn_sql_Active_insert(2, "Động cơ 2 hoạt động")
    } if(Active_ID2 == false & Active_ID2 != Active_ID2_aldone) {
        fn_sql_Active_ack(2);
    }
    Active_ID2_aldone = Active_ID2;
    // Active động cơ 3
    if(Active_ID3 == true & Active_ID3 != Active_ID3_aldone){
        fn_sql_Active_insert(3, "Động cơ 3 hoạt động")
    } if(Active_ID3 == false & Active_ID3 != Active_ID3_aldone) {
        fn_sql_Active_ack(3);
    }
    Active_ID3_aldone = Active_ID3;
    // Active động cơ 4
    if(Active_ID4 == true & Active_ID4 != Active_ID4_aldone){
      fn_sql_Active_insert(4, "Động cơ 4 hoạt động")
  } if(Active_ID4 == false & Active_ID4 != Active_ID4_aldone) {
      fn_sql_Active_ack(4);
  }
  Active_ID4_aldone = Active_ID4;
  // Active động cơ 5
  if(Active_ID5 == true & Active_ID5 != Active_ID5_aldone){
    fn_sql_Active_insert(5, "Động cơ 5 hoạt động")
} if(Active_ID5 == false & Active_ID5 != Active_ID5_aldone) {
    fn_sql_Active_ack(5);
  }
  Active_ID5_aldone = Active_ID5;
  // Active động cơ 6
  if(Active_ID6 == true & Active_ID6 != Active_ID6_aldone){
    fn_sql_Active_insert(6, "Động cơ 6 hoạt động")
  } if(Active_ID6 == false & Active_ID6 != Active_ID6_aldone) {
    fn_sql_Active_ack(6);
  }
  Active_ID6_aldone = Active_ID6;
  // Active động cơ 6
  if(Active_ID7 == true & Active_ID7 != Active_ID7_aldone){
    fn_sql_Active_insert(7, "Động cơ 7 hoạt động")
  } if(Active_ID7 == false & Active_ID7 != Active_ID7_aldone) {
    fn_sql_Active_ack(7);
  }
  Active_ID7_aldone = Active_ID7;
  // Active động cơ 8
  if(Active_ID8 == true & Active_ID8 != Active_ID8_aldone){
    fn_sql_Active_insert(8, "Động cơ 8 hoạt động")
  } if(Active_ID8 == false & Active_ID8 != Active_ID8_aldone) {
    fn_sql_Active_ack(8);
  }
  Active_ID8_aldone = Active_ID8;
  // Active động cơ 9
  if(Active_ID9 == true & Active_ID9 != Active_ID9_aldone){
    fn_sql_Active_insert(9, "Động cơ 9 hoạt động")
  } if(Active_ID9 == false & Active_ID9 != Active_ID9_aldone) {
    fn_sql_Active_ack(9);
  }
  Active_ID9_aldone = Active_ID9;
  // Active động cơ 10
  if(Active_ID10 == true & Active_ID10 != Active_ID10_aldone){
    fn_sql_Active_insert(10, "Động cơ 10 hoạt động")
  } if(Active_ID10 == false & Active_ID10 != Active_ID10_aldone) {
    fn_sql_Active_ack(10);
  }
  Active_ID10_aldone = Active_ID10;
}

// Đọc thị dữ liệu Active
io.on("connection", function(socket){
  socket.on("msg_Active_Show", function(data)
  {
      var sqltable_Name = "active";
      var query = "SELECT * FROM " + sqltable_Name + " WHERE Status = 'I';"; 
      sqlcon.query(query, function(err, results, fields) {
          if (err) {
              console.log(err);
          } else {
              const objectifyRawPacket = row => ({...row});
              const convertedResponse = results.map(objectifyRawPacket);
              socket.emit('Active_Show', convertedResponse);
          } 
      });
  });
});


// Tìm kiếm báo cáo theo khoảng thời gian
io.on("connection", function(socket){
  socket.on("msg_Active_ByTime", function(data)
  {
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset time Việt Nam (GMT7+)
      // Lấy thời gian tìm kiếm từ date time piker
      var timeS = new Date(data[0]); // Thời gian bắt đầu
      var timeE = new Date(data[1]); // Thời gian kết thúc
      // Quy đổi thời gian ra định dạng cua MySQL
      var timeS1 = "'" + (new Date(timeS - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeE1 = "'" + (new Date(timeE - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
      var timeR = timeS1 + " AND " + timeE1; // Thêm dấu cách xung quanh "AND" // Khoảng thời gian tìm kiếm (Time Range)

      var sqltable_Name = "Active"; // Tên bảng
      var dt_col_Name = "date_time";  // Tên cột thời gian

      var Query1 = "SELECT * FROM " + sqltable_Name + " WHERE " + dt_col_Name + " BETWEEN ";
      var Query = Query1 + timeR + ";";

      sqlcon.query(Query, function(err, results, fields) {
          if (err) {
              console.log(err);
          } else {
              const objectifyRawPacket = row => ({...row});
              const convertedResponse = results.map(objectifyRawPacket);
              socket.emit('Active_ByTime', convertedResponse);
          }
      });
  });
});
