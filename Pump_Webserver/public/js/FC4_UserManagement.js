// Danh sách người dùng
var admin = ["admin","123456@#"]
var user1 = ["user1","1"]
var user2 = ["user2","2"]

// Chương trình con
function login()
{
    var a = document.getElementById("inputuser").value;
    var b = document.getElementById("inputpass").value;
    // Admin
    if (a == admin[0] && b == admin[1])
    {
        fn_ScreenChange('Screen_Home','Screen_Man','Screen_Time','Screen_Alarm','Screen_Auto','Screen_Active');
        document.getElementById('id01').style.display='none';
    }
    // User 1
    else if (a == user1[0] && b == user1[1])
    {
        fn_ScreenChange('scr_Home','scr_Man','scr_Auto');
        document.getElementById('id01').style.display='none';
        document.getElementById("btt_scr_Home").disabled = true;
    }
    // User 2
    else if (a == user2[0] && b == user2[1])
    {
        fn_ScreenChange('scr_Time','scr_Alarm','scr_Time');
        document.getElementById('id01').style.display='none';
        document.getElementById("btt_scr_Home").disabled = true;
        document.getElementById("btt_scr_Auto").disabled = true;
    }
    else
    {
        window.location.href = '';
    }
}
function logout() // Ctrinh login
{
    alert("Đăng xuất thành công");
    window.location.href = 'Dev_by_TruongDinhTanSang.com_hot_line_0375543193';
}