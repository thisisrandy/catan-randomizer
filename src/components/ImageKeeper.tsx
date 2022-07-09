import * as images from "../images/index";

/**
 * Because not all boards use the same images, browsers will sometimes choose to
 * ask the server for an updated image when loading something that wasn't used
 * in the previous board. Our images don't change, so this always results in a
 * 304, but it causes a slight visible delay where the needed images aren't
 * available. When this happens, the old image from the spot with the same key
 * (the unique value react requires when mapping an array of something to JSX)
 * will be used or no image if no such key existed before. The result is a ugly
 * flicker that we'd like to avoid.
 *
 * A known solution to this problem is to keep all of the needed images on the
 * page but hidden, and that is precisely what this component provides. I've
 * asked at https://stackoverflow.com/q/72918289/12162258 if this is a preferred
 * way
 */
export default function ImageKeeper() {
  return (
    <>
      {Object.entries(images).map(([name, path]) => (
        <img key={name} alt={name} src={path} hidden={true} />
      ))}
    </>
  );
}
