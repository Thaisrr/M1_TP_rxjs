import { fromEvent, from, of } from "rxjs";
import {
  map,
  debounceTime,
  tap,
  catchError,
  switchMap,
  filter,
  finalize,
  pluck
} from "rxjs/operators";
import { ajax } from "rxjs/ajax";

export const log = (name) => (source$) =>
  source$.pipe(
    tap((value) => console.log(`${name}: `, value)),
    finalize(() => console.log(`${name}: complete`))
  );

function getInput() {
  return document.getElementById("username");
}

function writeUsersToCard(users) {
  console.log("in users to card");
  console.log("users ", users);
  const el = document.getElementById("container");

  const strValue = users
    .map(
      ({ login, avatar_url, html_url }) => `
  <a target="_blank" href=${html_url} class="flex bg-white p-4 my-2 items-center rounded-lg shadow hover:shadow-xl border-solid border-gray-400 border-2">
    <img src=${avatar_url} class="h-10 w-10 rounded-full mr-4 border-1 border-blue-500" />
    <span class="no-underline hover:underline text-blue-500 text-lg ">${login} <span/>
  </div>
  `
    )
    .join("");

  el.innerHTML = strValue;
}

const input = getInput();
const input$ = fromEvent(getInput(), "input");

input$
  .pipe(
    map((item) => item.target.value),
    debounceTime(200),
    log("before"),
    filter((s) => s.length > 3),
    log("after"),
    switchMap((search) => getUser(search)),
    pluck("items"),
    catchError((err) => of([])),
    log("final")
  )
  .subscribe((users) => {
    writeUsersToCard(users);
  });

/* Get user from api */
const getUser = (username) => {
  return ajax.getJSON(`https://api.github.com/search/users?q=${username}`);
};
