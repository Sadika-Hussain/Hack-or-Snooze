"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * Adds story icons if user is logged in
 * Checks if the current user owns the story
 * Checks if the story is a favorite of the current user
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const isOwnStory = currentUser && currentUser.ownStories.some(s => s.storyId === story.storyId);
  const isFavorite = currentUser && currentUser.favorites.some(s => s.storyId === story.storyId);

  const $storyMarkup = $(`
    <li id="${story.storyId}">
      ${currentUser ? generateStoryIcons(isOwnStory, isFavorite) : ''}
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
      <hr>
    </li>
  `);

  // If there is a current user, attach event listeners to the story icons (trash and favorite icons)
  if (currentUser) {
    attachStoryIconEventListeners($storyMarkup, story);
  }

  return $storyMarkup;
}

/** Generate icons for story markup. */

function generateStoryIcons(isOwnStory, isFavorite) {
  // If the current user owns the story, attach a trash (delete) icon to the story markup
  const trashIcon = isOwnStory ? '<i class="fa-solid fa-trash-can-arrow-up hidden"></i>' : '';

  // Add a star icon based on whether the story is a favorite
  const starIcon = `<i class="${isFavorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
  return `${trashIcon} ${starIcon}`;
}

/** Attach event listeners to story icons. */

function attachStoryIconEventListeners($storyMarkup, story) {

  // Attach a click event listener to the favorite (star) icon
  $storyMarkup.find('.fa-star').on('click', async function () {
    $(this).toggleClass('fa-regular fa-solid');
    if ($(this).hasClass('fa-solid')) {
      await currentUser.addNewFavorite(story);
    } else {
      await currentUser.deleteUserFavorite(story);
    }
  });

  // Attach a click event listener to the trash (delete) icon, refresh user's own stories list
  $storyMarkup.find('.fa-trash-can-arrow-up').on('click', async function () {
    $(this).parent().remove();
    await currentUser.removeStory(story);
    showOwnStories();
  });
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  storyList = await StoryList.getStories(); // Update story list 
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  hidePageComponents()
  $allStoriesList.show();
}

/** Function to handle submission of a new story
 * Adds the new story
 * Gets updated user's stories list from API
 * Refreshes the story list on page
 * Resets story form
 */
async function handleSubmitNewStory(evt) {
  evt.preventDefault();

  const title = $title.val().trim();
  const author = $author.val().trim();
  const url = $storyURL.val().trim();

  const newStory = { title, author, url }
  await storyList.addStory(currentUser, newStory);
  await currentUser.getUserStories();
  putStoriesOnPage();

  $storyForm.trigger("reset");
}


/** Show user's favorite stories */
async function showFavorites() {
  $allFavoritesList.empty();
  await currentUser.getUserFavorites();

  // If no favorites, display a message
  if (currentUser.favorites.length === 0) {
    $allFavoritesList.html('<p>No favorites added!</p>')
  }

  // Loop through all of the user's favorite stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allFavoritesList.append($story);
  }

  hidePageComponents();
  $allFavoritesList.show();
}

/** Show user's own stories */
async function showOwnStories() {
  $myStoriesList.empty();

  // If no stories, display a message
  if (currentUser.ownStories.length === 0) {
    $myStoriesList.html('<p>No stories added by user yet!</p>')
  }

  // Loop through all of the user's own stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $story.find('.fa-trash-can-arrow-up').removeClass('hidden');
    $myStoriesList.append($story);
  }

  hidePageComponents();
  $myStoriesList.show();
}

/** Attach event listeners for
 * - story form submission
 * - showing favorites
 * - showing user's own stories
*/
$storyForm.on("submit", handleSubmitNewStory);
$navfavorites.on('click', showFavorites);
$navMyStories.on('click', showOwnStories);