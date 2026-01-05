import Marquee from "./components/Marquee";
import { gsap } from "gsap";

const gallery = document.querySelector("[data-gallery]");
const list = document.querySelector("[data-gallery-list]");
const items = document.querySelectorAll("[data-gallery-image]");
const itemsInner = document.querySelectorAll(".c-marquee__item__inner");
const main = document.querySelector("[data-gallery-main]");
const preview = document.querySelector(".c-preview");
const previewIndex = document.querySelector("[data-preview-index]");

gsap.fromTo(itemsInner, {
  opacity: 0,
  clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
}, {
  duration: 1,
  opacity: 1,
  stagger: 0.04,
  ease: "expo.inOut",
  clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
  clearProps: true,
});

gsap.from(preview, {
  duration: 1,
  y: 5,
  opacity: 0,
  ease: "expo.inOut",
  clearProps: true,
});

const marquee = new Marquee({
  element: gallery,
  elements: {
    list,
    items,
    main,
    previewIndex,
  },
});

const update = () => {
  marquee.update();
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
