
module.exports.getDate = function(){
  let today = new Date();

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

    return today.toLocaleDateString("en-US", options);
}

module.exports.getDay = function(){
  let today = new Date();

  const options = {
    weekday: 'long',
  };

    return today.toLocaleDateString("en-US", options);
}
