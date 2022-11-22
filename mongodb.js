var arr=[[],[]];
arr[0]=[];
arr[1]=[];
arr[2]=[];

arr[0][0]="sonerozasik room"
arr[1][0]="soner room"
arr[2][0]="admin room"
arr[0][1]="sonerozasik"
arr[0][2]="admin"
arr[1][1]="sonerozasik"
arr[1][2]="allah"
arr[2][1]="sonersik"
arr[2][2]="yarrak"

console.log(arr);
console.log(arr.length);

var flag=0;
for(var i=0;i<arr.length;i++){
  if(arr[i][0]=="sonerozasik room"){
    delete arr[i];
    flag=1
  }
  if(flag==1 && arr[i+1]){
    arr[i]=arr[i+1];
  }
  if(i==arr.length-1){
    delete arr[i];
  }
}
console.log(arr);
console.log(arr.length);


