// Display selected file name
$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });
  
// Use fetch to call post route /video/upload
$('#posterUpload').on('change', function () {
    let formdata = new FormData();
    let image = $("#posterUpload")[0].files[0];
    console.log(image)
    formdata.append('posterUpload', image);
    console.log(formdata.get('posterUpload'))
    fetch('/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            console.log(data.file)
            if (data.err) {
                $('#pfpErr').text(data.err.message);
                $('#pfpErr').show();
            }
            else {
                if (data.file) {
                    $('#pfp').attr('src', data.file);
                    $('#pfpURL').attr('value', data.file); // set hidden field    
                }
                $('#pfpErr').hide();
            }
        })
}

});
$('#pfpUpload').on('change', function () {
    let formdata = new FormData();
    let image = $("#pfpUpload")[0].files[0];
    formdata.append('pfpUpload', image);
    fetch('/user/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            if (data.err) {
                $('#pfpErr').text(data.err.message);
                $('#pfpErr').show();
            }
            else {
                if (data.file) {
                    $('#pfp').attr('src', data.file);
                    $('#pfpURL').attr('value', data.file); // set hidden field    
                }
                $('#pfpErr').hide();
            }
        })
    
    });

