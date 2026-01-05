import Marquee from "./components/Marquee";
import { gsap } from "gsap";

const gallery = document.querySelector("[data-gallery]");
const list = document.querySelector("[data-gallery-list]");
const items = document.querySelectorAll("[data-gallery-image]");
const itemsInner = document.querySelectorAll(".c-marquee__item__inner");
const main = document.querySelector("[data-gallery-main]");

gsap.fromTo(itemsInner, {
  opacity: 0,
  clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
}, {
  duration: 1,
  opacity: 1,
  stagger: 0.04,
  ease: "expo.inOut",
  clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",

});



const marquee = new Marquee({
  element: gallery,
  elements: {
    list,
    items,
    main,
  },
});

const update = () => {
  marquee.update();
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
