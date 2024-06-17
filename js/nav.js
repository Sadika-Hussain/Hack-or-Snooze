"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show form to submit a new story on click on "submit" */ 

function showStoryForm() {
  hidePageComponents();
  $storyForm.show();
  $allStoriesList.show();
}

$navSubmitStory.on("click", showStoryForm);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logs in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $('.nav-separator').css('display', 'inline-block');
  $navLogin.hide();
  $navLogOut.show();
  $navSubmitStory.show();
  $navfavorites.show();
  $navMyStories.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
