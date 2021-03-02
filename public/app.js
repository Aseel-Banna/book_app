'use strict';
$('#updateForm').hide();
$('#updateBtn').on('click',function(){
    $('#updateForm').show();
    $('#updateBtn').hide();
})

$('#cancel').on('click', function(){
    $('#updateForm').hide();
    $('#updateBtn').show();
})