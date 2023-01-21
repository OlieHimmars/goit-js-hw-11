import { Notify } from 'notiflix';
import axios from 'axios';

import cardTemplate from './templates/card.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const search = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
});

let currentPage = 1;
let currentHits = 0;
let searchQuery = '';

btnLoadMore.style.visibility = 'hidden';
search.addEventListener('submit', onSubmitSearch);
btnLoadMore.addEventListener('click', onClickBtnLoadMore);

function renderCardImage(arr) {
  const markup = arr.map(item => cardTemplate(item)).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
};

async function onSubmitSearch(e) {
    e.preventDefault();
    if (e.currentTarget.searchQuery.value.trim() === '') { return };
  searchQuery = e.currentTarget.searchQuery.value.trim();
  currentPage = 1;

  if (searchQuery === '') {
    return;
    };
  const response = await fetchImages(searchQuery, currentPage);
  currentHits = response.hits.length;

  if (response.totalHits > 40) {
    btnLoadMore.style.visibility = 'visible';
    } else {
    btnLoadMore.style.visibility = 'hidden';
    };

  try {
    if (response.totalHits > 0) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      gallery.innerHTML = '';
      renderCardImage(response.hits);
        lightbox.refresh();

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * -100,
        behavior: 'smooth',
      });
    } else if (response.totalHits === 0) {
      gallery.innerHTML = '';
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
  } catch (error) {
    console.log(error);
  }
};

async function fetchImages(value, page) {
  const url = 'https://pixabay.com/api/';
  const key = '32978016-3960e3f75e2ebb9dbe039fb54';
  const ourRequest = `?key=${key}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;
    const response = await axios.get(`${url}${ourRequest}`);
    return response.data;
};

async function onClickBtnLoadMore() {
  currentPage += 1;
  const response = await fetchImages(searchQuery, currentPage);
  renderCardImage(response.hits);
  lightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits === response.totalHits) {
      btnLoadMore.style.visibility = 'hidden';
      Notify.info('We are sorry, but you have reached the end of search results.');
  }
};