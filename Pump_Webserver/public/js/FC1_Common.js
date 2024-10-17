////////////// YÊU CẦU DỮ LIỆU TỪ SERVER- REQUEST DATA //////////////
var myVar = setInterval(myTimer, 100);
function myTimer() {
    socket.emit("Client-send-data", "Request data client");
}

// Chương trình con chuyển trang
function fn_ScreenChange(scr_Home, scr_Man, scr_Auto, scr_Time,scr_Alarm,scr_Active)
{
    document.getElementById(scr_Home).style.visibility = 'visible';   // Hiển thị trang được chọn
    document.getElementById(scr_Man).style.visibility = 'hidden';    // Ẩn trang 1
    document.getElementById(scr_Auto).style.visibility = 'hidden';    // Ẩn trang 2
    document.getElementById(scr_Time).style.visibility = 'hidden';    // Ẩn trang 3
    document.getElementById(scr_Alarm).style.visibility = 'hidden';    // Ẩn trang 4
    document.getElementById(scr_Active).style.visibility = 'hidden';    // Ẩn trang 5
}


// Hàm chức năng hiển thị trạng thái symbol
function fn_SymbolStatus(ObjectID, SymName, Tag)
{
    var imglink_0 = "images/Symbol/" + SymName + "_0.png"; // Trạng thái tag = 0
    var imglink_1 = "images/Symbol/" + SymName + "_1.png"; // Trạng thái tag = 1
    var imglink_2 = "images/Symbol/" + SymName + "_2.png"; // Trạng thái tag = 2
    var imglink_3 = "images/Symbol/" + SymName + "_3.png"; // Trạng thái tag = 3
    var imglink_4 = "images/Symbol/" + SymName + "_4.png"; // Trạng thái tag = 4
    var imglink_5 = "images/Symbol/" + SymName + "_5.png"; // Trạng thái tag = 5
    socket.on(Tag, function(data){
        if (data == 0)
        {
            document.getElementById(ObjectID).src = imglink_0;
        }
        else if (data == 1)
        {
            document.getElementById(ObjectID).src = imglink_1;
        }
        else if (data == 2)
        {
            document.getElementById(ObjectID).src = imglink_2;
        }
        else if (data == 3)
        {
            document.getElementById(ObjectID).src = imglink_3;
        }
        else if (data == 4)
        {
            document.getElementById(ObjectID).src = imglink_4;
        }
        else
        {
            document.getElementById(ObjectID).src = imglink_0;
        }
    });
}

// Hàm hiển thị màu nút nhấn
function fn_btt_Color(tag, bttID, on_Color, off_Color){
    socket.on(tag,function(data){
        if(data == true){
            document.getElementById(bttID).style.backgroundColor = on_Color;
        } else{
            document.getElementById(bttID).style.backgroundColor = off_Color;
        }
    });
}

// Hàm hiển thị dữ liệu lên IO Field
function fn_IOFieldDataShow(tag, IOField, tofix){
    socket.on(tag,function(data){
        if(tofix == 0){
            document.getElementById(IOField).value = data;
        } else{
        document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}


// Hàm chức năng nút sửa/lưu dữ liệu
function fn_DataEdit(button1, button2)
{
    document.getElementById(button1).style.zIndex='1';  // Hiển nút 1
    document.getElementById(button2).style.zIndex='0';  // Ẩn nút 2
}
