///// HÀM CHỨC NĂNG NÚT NHẤN SỬA //////
// Tạo 1 tag tạm báo đang sửa dữ liệu
var Auto_data_edditting = false;
function fn_Auto_EditBtt(bttSaveID, bttEditID){
    // Cho hiển thị nút nhấn lưu
    fn_DataEdit(bttSaveID, bttEditID);
    // Cho tag báo đang sửa dữ liệu lên giá trị true
    Auto_data_edditting = true;
    // Kích hoạt chức năng sửa của các IO Field
    
    document.getElementById("tbx_Auto_Real").disabled = false; // Tag Real
}
///// HÀM CHỨC NĂNG NÚT NHẤN LƯU //////
function fn_Auto_SaveBtt(bttSaveID, bttEditID){
    // Cho hiển thị nút nhấn sửa
    fn_DataEdit(bttEditID, bttSaveID);
    // Cho tag đang sửa dữ liệu về 0
    Auto_data_edditting = false;
                        // Gửi dữ liệu cần sửa xuống PLC
    var data_edit_array = [ 
                            document.getElementById('tbx_Auto_Real').value];
    socket.emit('cmd_Auto_Edit_Data', data_edit_array);
    alert('Dữ liệu đã được lưu!');
    // Vô hiệu hoá chức năng sửa của các IO Field
    
    document.getElementById("tbx_Auto_Real").disabled = true; // Tag Real
}

// Hàm chức năng đọc dữ liệu lên IO Field
function fn_Auto_IOField_IO(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0 & Auto_data_edditting != true)
        {
            document.getElementById(IOField).value = data;
        }
        else if(Auto_data_edditting != true)
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}