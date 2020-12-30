function select_switch(input_switch,button) {
    document.getElementById(input_switch).click()
    console.log(button)
    button.classList.toggle('selected');
    button.classList.toggle('not_selected');
        console.log(button)

}