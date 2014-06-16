// Userlist data array for filling in info box
var userListData = [];

// Playerlist data array for filling in info box
var playerListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    // populateTable();

    // Populate the player table on initial page load
    populateSummoners();

    // Username link click
    // $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    // $('#btnAddUser').on('click', addUser);

    // Delete User link click
    // $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    // Playername link click
    $('#playerList table tbody').on('click', 'td a.linkshowplayer', showPlayerInfo);

    // Add User button click
    $('#btnFindPlayer').on('click', findPlayers);

});

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // Stick our user data array into a userlist variable in the global object
        userListData = data;
        
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Fill table with data
function populateSummoners() {

    // jQuery AJAX call for JSON
    $.getJSON( '/players/playerlist', function( data ) {

        addSummonersToTable(data);

    });
};

// For array of players, add them all to HTML table
function addSummonersToTable(players) {
    
    // Starting content of table
    var tableContent = $('#playerList table tbody').html();

    // For each item in our JSON, add a table row and cells to the content string
    $.each(players, function() {
        tableContent += '<tr>';
        tableContent += '<td><a href="#" class="linkshowplayer" rel="' + this.name + '" title="Show Details">' + this.name + '</a></td>';
        tableContent += '<td>' + this.id + '</td>';
        tableContent += '<td>' + this.summonerLevel + '</td>';
        tableContent += '</tr>';
        playerListData.push(this);

    });

    // Final form of table
    $('#playerList table tbody').html(tableContent);
}

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);
   
    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};

// Show Player Info
function showPlayerInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var playerName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = playerListData.map(function(arrayItem) { return arrayItem.name; }).indexOf(playerName);
   
    // Get our Player Object
    var player = playerListData[arrayPosition];

//"id":22822518,"name":"Schwarzenlager","profileIconId":625,"summonerLevel":30,"revisionDate":1402340126000
//"id":56306722,"name":"Wodan the Hunter","profileIconId":6,"summonerLevel":1,"revisionDate":1402506649000

    //Populate Info Box
    $('#playerInfoName').text(player.name);
    $('#playerInfoName').text(player.name);
    $('#playerInfoLevel').text(player.summonerLevel);
    $('#playerInfoLastRevised').text($.format.date(player.revisionDate, "E MMM d, yyyy"));
    $('#playerInfoIcon').attr('src', 'http://ddragon.leagueoflegends.com/cdn/4.4.3/img/profileicon/' + player.profileIconId + '.png');

    // 1398449208000
};


// Add Player to DB
function addPlayersToDb(players) {

    for (i = 0; i < players.length; ++i) {
        var player = players[i];
        // Use AJAX to post the object to our addplayer service
        $.ajax({
            type: 'POST',
            data: player,
            url: '/players/addplayer',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg != '') {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
};


// Find Player on Riot
function findPlayers(event) {

    event.preventDefault();

    var playerNames = $('#findPlayer fieldset input#inputPlayerName').val();

    // TODO Do some simple validation and remove spaces

    // Use AJAX to post the object to our findplayer service
    $.ajax({
        type: 'GET',
        data: 'names=' + playerNames,
        url: '/players/findplayers',
        dataType: 'JSON'
    }).done(function( playerList ) {

        if (playerList === '') {
            // If something goes wrong, alert the error message that our service returned
            alert('No players found: ' + playerNames);
        }
        else {
            // Clear the form inputs
            $('#findPlayer fieldset input').val('');

            // // Add players to DB
            addPlayersToDb(playerList);

            // Update the table
            addSummonersToTable(playerList);

        }
    });
};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

