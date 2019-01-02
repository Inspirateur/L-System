function init2D(values, width, height) {
    let matrix = [];
    if(values == null) {
        // If no values are provided, create an identity matrix (if rectangular), else just an empty matrix
        for(let i=0; i<width; i++) {
            let column = Array(height);
            column.fill(0);
            if(width == height) {
                column[i] = 1;
            }
            matrix.push(column);
        }
    } else {
        // Uses the provided values to initialize a new matrix
        // Assumes the values provided is a Rectangular 2D array
        for(let i=0; i<values.length; i++) {
            let column = [];
            for(let j=0; j<values[0].length; j++) {
                column.push(values[i][j]);
            }
            matrix.push(column);
        }
    }
    return matrix;
}


function Matrix2D(values, width=2, height=2) {
    this.values = init2D(values, width, height);

    this.inv = function() {
        let M = this.values;
        // I use Guassian Elimination to calculate the inverse:
        //if the matrix isn't square: exit (error)
        if(M.length !== M[0].length){return;}

        //create the identity matrix (I), and a copy (C) of the original
        let i=0, ii=0, j=0, dim=M.length, e=0, t=0;
        let I = [], C = [];
        for(i=0; i<dim; i+=1){
            // Create the row
            I[I.length]=[];
            C[C.length]=[];
            for(j=0; j<dim; j+=1){

                //if we're on the diagonal, put a 1 (for identity)
                if(i==j){ I[i][j] = 1; }
                else{ I[i][j] = 0; }

                // Also, make the copy of the original
                C[i][j] = M[i][j];
            }
        }

        // Perform elementary row operations
        for(i=0; i<dim; i+=1){
            // get the element e on the diagonal
            e = C[i][i];

            // if we have a 0 on the diagonal (we'll need to swap with a lower row)
            if(e==0){
                //look through every row below the i'th row
                for(ii=i+1; ii<dim; ii+=1){
                    //if the ii'th row has a non-0 in the i'th col
                    if(C[ii][i] != 0){
                        //it would make the diagonal have a non-0 so swap it
                        for(j=0; j<dim; j++){
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //repace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //repace ii'th by temp
                        }
                        //don't bother checking other rows since we've swapped
                        break;
                    }
                }
                //get the new diagonal
                e = C[i][i];
                //if it's still 0, not invertable (error)
                if(e==0){return}
            }

            // Scale this row down by e (so we have a 1 on the diagonal)
            for(j=0; j<dim; j++){
                C[i][j] = C[i][j]/e; //apply to original matrix
                I[i][j] = I[i][j]/e; //apply to identity
            }

            // Subtract this row (scaled appropriately for each row) from ALL of
            // the other rows so that there will be 0's in this column in the
            // rows above and below this one
            for(ii=0; ii<dim; ii++){
                // Only apply to other rows (we want a 1 on the diagonal)
                if(ii==i){continue;}

                // We want to change this element to 0
                e = C[ii][i];

                // Subtract (the row above(or below) scaled by e) from (the
                // current row) but start at the i'th column and assume all the
                // stuff left of diagonal is 0 (which it should be if we made this
                // algorithm correctly)
                for(j=0; j<dim; j++){
                    C[ii][j] -= e*C[i][j]; //apply to original matrix
                    I[ii][j] -= e*I[i][j]; //apply to identity
                }
            }
        }

        // we've done all operations, C should be the identity
        // matrix I should be the inverse:
        return new Matrix2D(I);
    }

    this.add = function(matrix2D) {
        let res = new Matrix2D(null, this.values.length, this.values[0].length);
        for(let i=0; i<res.values.length; i++) {
            for(let j=0; j<res.values[0].length; j++) {
                res.values[i][j] = this.values[i][j] + matrix2D.values[i][j];
            }
        }
        return res;
    }

    this.sub = function(matrix2D) {
        let res = new Matrix2D(null, this.values.length, this.values[0].length);
        for(let i=0; i<res.values.length; i++) {
            for(let j=0; j<res.values[0].length; j++) {
                res.values[i][j] = this.values[i][j] - matrix2D.values[i][j];
            }
        }
        return res;
    }

    this.mult = function(matrix2D) {
        let res = new Matrix2D(null, this.values.length, matrix2D.values[0].length);
        for(let i=0; i<res.values.length; i++) {
            for(let j=0; j<res.values[0].length; j++) {
                let sum = 0;
                for(let k=0; k<this.values[0].length; k++) {
                    sum += this.values[i][k]*matrix2D.values[k][j];
                }
                res.values[i][j] = sum;
                // To avoid non-zero due to rounding errors
                if(Math.abs(res.values[i][j]) < 0.000000000000001) {
                    res.values[i][j] = 0;
                }
            }
        }
        return res;
    }

    this.pow = function(rank) {
        let res = new Matrix2D(this.values);
        for(let i=2; i<=rank; i++) {
            res = res.mult(this);
        }
        return res;
    }

    this.display = function() {
        let maxLen = Math.max(this.values).toString().length;
        for(let i=0; i<this.values.length; i++) {
            let line = "";
            for(let j=0; j<this.values[0].length; j++) {
                let valRep = this.values[i][j].toString();
                line += valRep;
                for(let space=0; space <= maxLen-valRep.length; space++) {
                    line += " ";
                }
            }
            console.log(line);
        }
    }
}
