var txt = '[{"title":"1984","imgURL":"https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/1984_play_artwork.jpg/220px-1984_play_artwork.jpg","price":"69.69","desc":"Nineteen Eighty-Four: A Novel, often published as 1984, is a dystopian novel by English novelist George Orwell. It was published in June 1949 by Secker & Warburg as Orwell\'s ninth and final book completed in his lifetime."}]';
var obj = JSON.parse(txt);
var title = obj.title;
console.log(obj[0].title);
  