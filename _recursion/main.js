'use strict'
console.log('recursion');

print(5);

function print(count) {
    if (count === 0) return;
    console.log('asia');
    count--;
    print(count);
}

// sum1(10)
// 1+2+3+4...+10

console.log(sum1(10));

function sum1(count) {
    console.log(`Start with ${count}`);
    if (count === 0) {
        console.log("returning 0");
        return count;
    } else {
        var result = sum1(count - 1);
        console.log(`Count ${count}: returning sum1(${count}-1)=${result} + ${count}`);
        return result + count;
    }
}


function fullExpend(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            mat[i][j].isShown === true;
            if (mat[i][j].minesAroundCount === 0){
                fullExpend(i, j, mat); 
            }
        }
    }
}