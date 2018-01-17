function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}

function isAddress(address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return 0;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return 1;
    } else {
        return isChecksumAddress(address);
    }
};

function isChecksumAddress(address) {
    address = address.replace('0x', '');
    var addressHash = sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++) {
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return 0;
        }
    }
    return 1;
};

function sign() {
    if (isAddress(trim($('[name=addrETH]').val())) == '1') {
        if ($('[name=addrETH]').val()) {
        	setCookie('ethAddress',trim($('[name=addrETH]').val()),10);

            $.post("/start-mining", {
                "ethAddress": trim($('[name=addrETH]').val())
            }, function(data) {
            	window.location.href = '/home.html#div-upgrade';
            });
        } else {
            $('.div-error').html('<br />Ethereum address is invalid! Enter correct wallet address or <a style="color:#fff" href="https://www.myetherwallet.com/" target="_blank">create new Ethereum address</a>.');
        }
    } else {
        $('.div-error').html('<br />Ethereum address is invalid! Enter correct wallet address or <a style="color:#fff" href="https://www.myetherwallet.com/" target="_blank">create new Ethereum address</a>.');
    }
}

function upgrade(level) {
    $('#upgradeAjax').show().html('<br><img src="images/loading.gif"/>');
    $.post("/upgrade", {
        "level": level
    }, function(data) {
        $('#upgradeAjax').show().html(data);
    });
}

function withdraw() {
    $('#alert-withdraw').text('Confirming withdrawal...');
    $.post("/withdraw", {
        "ethAddress": getCookie("ethAddress"),
        "amount": $('#widthsum').val()
    }, function(data) {
        if(data == "BALANCE_BELOW_THRESHOLD") {
            $('#alert-withdraw').html("Your Account balance is less than 0.05 ETH. Please wait for the balance to reach 0.05 ETH or <b><a style='margin-left:1%; color: white'href='#div-upgrade'>upgrade your plan.</a></b>");
        }
        else if(data == "AMOUNT_BELOW_THRESHOLD") {
            $('#alert-withdraw').html("You cannot withdraw less than 0.05 ETH.");
        }
        else if (data == "WITHDRAWAL_CONFIRMED") {
            $('#alert-withdraw').html("Your withdrawal is confirmed!");
            setTimeout(function() {
                window.location = '/'
            }, 2000);
        } else if (data == "AMOUNT_EXCEEDS_BALANCE"){
            $('#alert-withdraw').text("Insufficient balance. Please try again with lower amount.");
        } else {
            $('#alert-withdraw').text("Something went wrong. Please try again later.");
        }
    });
}

function showWithdraw() {
    $('#divamount').hide();
    $('.button-withdraw').hide();
    $('.button-status').hide();
    $('.button-confirm').show();
    $('.button-cancel').show();
    $('#widthsum').show();
    $('.alert1').hide();
    $('#alert-withdraw').show();
}

function cancel_withdraw(id) {
    $.post("", {
        task: "cancel",
        id: id
    }, function(data) {
        if (data) window.location = '/account?f=1';
    });
}

function updateBalance(v) {
    var un = Math.round(Math.random() * 10000);
    var date = new Date();
    date.setTime(date.getTime() + (86400 * 30));
    $({
        Counter: parseFloat($('#divamountValue').text())
    }).animate({
        Counter: (parseFloat($('#divamountValue').text()) + v).toFixed(8)
    }, {
        duration: 300,
        easing: 'swing',
        step: function() {
            $('#divamountValue').show().html((this.Counter).toFixed(8));
            var gg = this.Counter;
            document.cookie = 'sat=' + (this.Counter).toFixed(8) + ';expires=' + date.toGMTString();
        }
    });
}

function setClipboard(value) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function openCity(evt, cityName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("city");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-orange", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " w3-orange";
}

function offerRemaining(level, div) {
    $.post("", {
        "task": "offerRemaining",
        "level": level
    }, function(data) {
        $('#' + div).show().html(data);
    });
}

function morepayouts() {
    $.post("", {
        task: "morepayouts",
        offset: $('#payouts tbody tr').size()
    }, function(data) {
        if (data) $('#payouts tbody').append(data);
        else $('.list_more').text('No more data').removeAttr('href');
    });
}



function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function logout(){
	eraseCookie('ethAddress');
	window.location="/";
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

function getAndPopulateBalance() {
    $.get("/balance", {ethAddress: getCookie("ethAddress")}, function(data){
        $("#divamountValue").html(data);

        updateBalance(2.0E-8);
        setInterval(function(){ updateBalance(2.0E-8);},3000);
    });
}

$(document).ready(function() {
    if(("#isHomePage").length > 0) {
        getAndPopulateBalance();
        $("#withdrawalEthAddress").html(getCookie("ethAddress"));
        $( ".button-withdraw").click(function() {
	        $("#header-balance").animate({height: "250px" }, 300 );
	    });
    }

});
