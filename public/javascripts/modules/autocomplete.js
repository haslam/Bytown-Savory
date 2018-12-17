function autocomplete(input, latInput, lngInput) {
  if (!input) return;
  const dropdown = new google.maps.places.Autocomplete(input);
  //add Google's addListener - same as JS addEventListner
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace(); //gives the Geometry data
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  //if someone hits enter on the address filed, don't submit the form
  input.on('keydown', (e) => {
    if(e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete