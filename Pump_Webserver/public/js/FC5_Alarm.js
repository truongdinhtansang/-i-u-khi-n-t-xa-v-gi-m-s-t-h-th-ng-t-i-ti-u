// Chương trình con đọc dữ liệu SQL
function fn_Alarm_Show(){
    socket.emit("msg_Alarm_Show", "true");
    socket.on('Alarm_Show',function(data){
        fn_table_Alarm(data);
    });
}

// Chương trình con hiển thị SQL ra bảng
function fn_table_Alarm(data){
    if(data){
        $("#table_Alarm tbody").empty(); 
        var len = data.length;
        var txt = "<tbody>";
        if(len > 0){
            for(var i=0;i<len;i++){
                    txt += "<tr><td>"+data[i].date_time
                        +"</td><td>"+data[i].ID
                        +"</td><td>"+data[i].Status
                        +"</td><td>"+data[i].AlarmName
                        +"</td></tr>";
                    }
            if(txt != ""){
            txt +="</tbody>"; 
            $("#table_Alarm").append(txt);
            }
        }
    }   
}

/// Tìm kiếm cảnh báo theo thời gian
function fn_Alarm_By_Time() {
    var timeStart = document.getElementById('dtpk_AL_Search_Start').value;
    var timeEnd = document.getElementById('dtpk_AL_Search_End').value;

    if (timeStart === "" || timeEnd === "") {
        alert("Vui lòng chọn khoảng thời gian hợp lệ!");
        return;
    }

    var val = [timeStart, timeEnd];
    socket.emit('msg_Alarm_ByTime', val);
    socket.on('Alarm_ByTime', function(data){
        fn_table_Alarm(data); // Show alarm
    });
}


