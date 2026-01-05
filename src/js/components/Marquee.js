import AutoBind from "../utils/bind";
import Prefix from "prefix";
import { getOffset, mapEach } from "../utils/dom";
import { lerp, clamp, } from "../utils/math";
import NormalizeWheel from "normalize-wheel";
import gsap from "gsap";

export default class {
  constructor({ element, elements }) {
    AutoBind(this);

    this.element = element;
    this.elements = elements;

    this.transformPrefix = Prefix("transform");
    this.disableVelocity = false;

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      last: 0,
      clamp: 0,
    };

    mapEach(this.elements.items, (element) => {
      const offset = getOffset(element);

      element.extra = 0;
      element.width = offset.width;
      element.offset = offset.left;
      element.position = 0;
      element.distortion = {
        current: 0,
        target: 0,
        ease: 0.1
      };
    });

    this.length = this.elements.items.length;

    this.width = this.elements.items[0].width;
    this.widthTotal = this.elements.list.getBoundingClientRect().width;

    this.velocityValue = 0.5;
    this.velocity = this.velocityValue;

    this.addEventListeners();
    this.enable();
  }

  enable() {
    this.isEnabled = true;

    this.elements.list.addEventListener("mouseenter", () => {
      this.hovered = true;
    });

    this.elements.list.addEventListener("mouseleave", () => {
      this.hovered = false;
    });

    this.update();
  }

  disable() {
    this.isEnabled = false;

    mapEach(this.elements.items, (element, index) => {
      this.transform(element, 0, 0, 0);
    });
  }

  onTouchDown(event) {
    this.elements.list.classList.add("dragging");

    if (!this.isEnabled) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown || !this.isEnabled) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    this.elements.list.classList.remove("dragging");
    if (!this.isEnabled) return;

    this.isDown = false;
  }

  onWheel(event) {
    if (!this.isEnabled) return;
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY * 0.5;
    this.scroll.target += speed;
  }

  transform(element, x) {
    if (Math.round(this.scroll.current) === Math.round(this.scroll.last)) return;

    element.style[this.transformPrefix] = `translate3d(${Math.floor(x)}px, 0, 0)`;


    const offset = getOffset(element);

    if (offset.left < 10) {
      this.setPreview(element);
    }
  }

  setPreview(element) {
    const previewConainerHeight = getOffset(this.elements.preview).height - 60;
    const previewIndexHeight = getOffset(this.elements.previewIndex).height;
    const index = [...this.elements.items].indexOf(element);
    this.elements.main.src = element.querySelector("img").src;
    this.elements.previewIndex.textContent = `${index + 1}`.padStart(3, "0");
    const offset = (previewConainerHeight - previewIndexHeight) / this.elements.items.length + 1;
    this.elements.previewIndex.style.transform = `translateY(${offset * index}px)`;
  }

  onResize() {
    this.width = this.elements.items[0].getBoundingClientRect().width;
    this.widthTotal = this.elements.list.getBoundingClientRect().width;

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      last: 0,
    };

    mapEach(this.elements.items, (element) => {
      this.transform(element, 0);

      const offset = getOffset(element);

      element.extra = 0;
      element.width = offset.width;
      element.offset = offset.left;
      element.position = 0;
    });
  }

  addEventListeners() {
    this.elements.list.addEventListener("mousedown", this.onTouchDown, {
      passive: true,
    });
    this.elements.list.addEventListener("mousemove", this.onTouchMove, {
      passive: true,
    });
    this.elements.list.addEventListener("mouseup", this.onTouchUp, {
      passive: true,
    });

    this.elements.list.addEventListener("touchstart", this.onTouchDown, {
      passive: true,
    });
    this.elements.list.addEventListener("touchmove", this.onTouchMove, {
      passive: true,
    });
    this.elements.list.addEventListener("touchend", this.onTouchUp, {
      passive: true,
    });

    document.addEventListener("wheel", this.onWheel, {
      passive: true,
    });

    const rangeValue = 200;

    this.elements.list.addEventListener("mousemove", e => {
      this.elements.items.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const distance = Math.sqrt(dx * dx);

        const value = rangeValue - clamp(-rangeValue, rangeValue, distance);
        const topPercent = gsap.utils.mapRange(0, rangeValue, 0, 18, value);

        element.distortion.target = topPercent;
      });
    })

    this.elements.list.addEventListener("mouseleave", () => {
      this.elements.items.forEach((element, index) => {
        element.distortion.target = 0;
      });
    })

    this.elements.items.forEach((element, index) => {
      element.addEventListener("click", (e) => {
        e.preventDefault();
        this.setPreview(e.currentTarget);
      })
    })
  }

  update() {
    if (!this.isEnabled) return;

    if (this.element.classList.contains("active")) {
      this.disableVelocity = false;
    } else {
      this.disableVelocity = true;
    }

    this.scroll.target += this.velocity;

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);

    this.isVelocity = this.hovered || this.disableVelocity;

    const scrollClamp = Math.round(this.scroll.current % this.widthTotal);

    if (this.scroll.current < this.scroll.last) {
      this.direction = "down";
      this.velocity = this.isVelocity ? 0 : -this.velocityValue;
    } else {
      this.direction = "up";
      this.velocity = this.isVelocity ? 0 : this.velocityValue;
    }

    mapEach(this.elements.items, (element, index) => {
      element.position = -this.scroll.current - element.extra;

      const offset = element.position + element.offset + element.width;

      element.isBefore = offset < 0;
      element.isAfter = offset > this.widthTotal;

      if (this.direction === "up" && element.isBefore) {
        element.extra = element.extra - this.widthTotal;

        element.isBefore = false;
        element.isAfter = false;
      }

      if (this.direction === "down" && element.isAfter) {
        element.extra = element.extra + this.widthTotal;

        element.isBefore = false;
        element.isAfter = false;
      }

      element.clamp = element.extra % scrollClamp;

      element.distortion.current = lerp(
        element.distortion.current,
        element.distortion.target,
        element.distortion.ease
      );

      const topPercent = element.distortion.current;
      const bottomPercent = 100 - topPercent;

      element.style.setProperty("--top-left-y", `${topPercent}%`);
      element.style.setProperty("--top-right-y", `${topPercent}%`);
      element.style.setProperty("--bottom-right-y", `${bottomPercent}%`);
      element.style.setProperty("--bottom-left-y", `${bottomPercent}%`);

      this.transform(element, element.position);
    });

    this.scroll.last = this.scroll.current;
    this.scroll.clamp = scrollClamp;
  }
}
