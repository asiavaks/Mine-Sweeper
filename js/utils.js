'use strict';

// function renderBoard(mat, selector) {
//     var strHTML = '';
//     for (var i = 0; i < mat.length; i++) {
//       strHTML += '<tr>';
//       for (var j = 0; j < mat[0].length; j++) {
//         var cell = mat[i][j];
//         var className = 'cell cell' + i + '-' + j;
//         strHTML += `<td class="${className} onclick="cellClicked(this)">${cell}</td>`;
//       }
//       strHTML += '</tr>'
//     }
//     var elContainer = document.querySelector(selector);
//     elContainer.innerHTML = strHTML;
//   }

  function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
  }

  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }