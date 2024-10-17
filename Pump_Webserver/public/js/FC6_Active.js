// Chương trình con đọc dữ liệu SQL
function fn_Active_Show(){
    socket.emit("msg_Active_Show", "true");
    socket.on('Active_Show',function(data){
        fn_table_Active(data);
    });
}

// Chương trình con hiển thị SQL ra bảng
function fn_table_Active(data){
    if(data){
        $("#table_Active tbody").empty(); 
        var len = data.length;
        var txt = "<tbody>";
        if(len > 0){
            for(var i=0;i<len;i++){
                    txt += "<tr><td>"+data[i].date_time
                        +"</td><td>"+data[i].ID
                        +"</td><td>"+data[i].Status
                        +"</td><td>"+data[i].ActiveName
                        +"</td></tr>";
                    }
            if(txt != ""){
            txt +="</tbody>"; 
            $("#table_Active").append(txt);
            }
        }
    }   
}

/// Tìm kiếm active theo thời gian
function fn_Active_By_Time() {
    var timeStart1 = document.getElementById('dtpk_AL_Search_Start1').value;
    var timeEnd1 = document.getElementById('dtpk_AL_Search_End1').value;

    if (timeStart1 === "" || timeEnd1 === "") {
        alert("Vui lòng chọn khoảng thời gian hợp lệ!");
        return;
    }

    var val = [timeStart1, timeEnd1];
    socket.emit('msg_Active_ByTime', val);
    socket.on('Active_ByTime', function(data){
        fn_table_Active(data); // Show Active
    });
}


