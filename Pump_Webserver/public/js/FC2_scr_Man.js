///// HÀM CHỨC NĂNG NÚT NHẤN SỬA //////
// Tạo 1 tag tạm báo đang sửa dữ liệu
var Man_data_edditting = false;
function fn_Man_EditBtt(bttSaveID, bttEditID){
    // Cho hiển thị nút nhấn lưu
    fn_DataEdit(bttSaveID, bttEditID);
    // Cho tag báo đang sửa dữ liệu lên giá trị true
    Man_data_edditting = true;
    // Kích hoạt chức năng sửa của các IO Field
    document.getElementById("tbx_set_tocdo1").disabled = false; 
    document.getElementById("tbx_set_tocdo2").disabled = false; 
    document.getElementById("tbx_set_tocdo3").disabled = false; 
    document.getElementById("tbx_set_tocdo4").disabled = false; 
    document.getElementById("tbx_set_tocdo5").disabled = false; 
    document.getElementById("tbx_set_tocdo6").disabled = false; 
    document.getElementById("tbx_set_tocdo7").disabled = false; 
    document.getElementById("tbx_set_tocdo8").disabled = false; 
    document.getElementById("tbx_set_tocdo9").disabled = false; 
    document.getElementById("tbx_set_tocdo10").disabled = false; 
}
///// HÀM CHỨC NĂNG NÚT NHẤN LƯU //////
function fn_Man_SaveBtt(bttSaveID, bttEditID){
    // Cho hiển thị nút nhấn sửa
    fn_DataEdit(bttEditID, bttSaveID);
    // Cho tag đang sửa dữ liệu về 0
    Man_data_edditting = false;
                        // Gửi dữ liệu cần sửa xuống PLC
    var data_edit_array =  [ document.getElementById("tbx_set_tocdo1").value, 
                            document.getElementById("tbx_set_tocdo2").value, 
                            document.getElementById("tbx_set_tocdo3").value, 
                            document.getElementById("tbx_set_tocdo4").value, 
                            document.getElementById("tbx_set_tocdo5").value, 
                            document.getElementById("tbx_set_tocdo6").value, 
                            document.getElementById("tbx_set_tocdo7").value, 
                            document.getElementById("tbx_set_tocdo8").value, 
                            document.getElementById("tbx_set_tocdo9").value, 
                            document.getElementById("tbx_set_tocdo10").value];   
    socket.emit('cmd_Man_Edit_Data', data_edit_array);
    alert('Dữ liệu đã được lưu!');
    // Vô hiệu hoá chức năng sửa của các IO Field
    document.getElementById("tbx_set_tocdo1").disabled = true; // Tag bool
    document.getElementById("tbx_set_tocdo2").disabled = true; // Tag Integer
    document.getElementById("tbx_set_tocdo3").disabled = true; // Tag Real
    document.getElementById("tbx_set_tocdo4").disabled = true;
    document.getElementById("tbx_set_tocdo5").disabled = true;
    document.getElementById("tbx_set_tocdo6").disabled = true;
    document.getElementById("tbx_set_tocdo7").disabled = true;
    document.getElementById("tbx_set_tocdo8").disabled = true;
    document.getElementById("tbx_set_tocdo9").disabled = true;
    document.getElementById("tbx_set_tocdo10").disabled = true;

}

// Hàm chức năng đọc dữ liệu lên IO Field
function fn_Man_IOField_IO(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0 & Man_data_edditting != true)
        {
            document.getElementById(IOField).value = data;
        }
        else if(Man_data_edditting != true)
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}