import { useContext } from "react";
import { Sidebar, Search, FloorOption } from "../components";
import { MapContext } from "../shared";
import ShowIOS from "./ShowIOS";
import Show from "./Show";

const Home = ({ isIOS }) => {
  const { selectedBlockOption, selectedFloorOption } = useContext(MapContext);

  return (
    <>
      <FloorOption />
      <Search />
      <Sidebar />
      {isIOS ? (
        <ShowIOS
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      ) : (
        <Show
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      )}
    </>
  );
};

export default Home;
