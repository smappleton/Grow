class RegionMap {
   constructor(d,grid){
      this.divider = d;
      //uses flat indices like the available array
      this.rmap = new Array(d*d);
      let xsize = floor(cols/d);
      let ysize = floor(rows/d);
      let xmod = cols%d;
      let ymod = rows%d;
      //region x and y
      for(let y=0; y<d; y++){
         for(let x=0; x<d; x++){
           let curr = [];
           //find top left of region and region size
           let topX = x*xsize;
           let topY = y*ysize;
           //find correct sizes
           let myXsize = xsize;
           let myYsize = ysize;
           //take care of leftovers on edges
           if (x == d){
              myXsize += xmod; 
           }
           if(y == d){
              myYsize += ymod; 
           }
           
           //loop over rectangle
           for(let areaY = topY; areaY<topY+myYsize; areaY++){
             for(let areaX = topX; areaX<topX+myXsize; areaX++){
                 if(!grid[areaX][areaY].owned){
                    let val = areaX + (areaY*cols);
                    curr.push(val); 
                 }
             }
           }
           //find flat index
           let flat = x + (y*d);
           this.rmap[flat] = curr;
         }
      }
   }  
}
