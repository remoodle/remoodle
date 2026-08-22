import { useContext } from "react";
import { Button, Flex, useColorModeValue } from "@chakra-ui/react";
import { MapContext } from "../shared";

const FloorOptionButton = () => {
  const colorFloorOptionCurrent = useColorModeValue("#edf2f7", "#242a36");
  const colorBgFloorOption = useColorModeValue("#242a36", "#edf2f7");
  const colorTextFloorOption = useColorModeValue("#edf2f7", "#242a36");
  const colorTextCurrentFloorOption = useColorModeValue("#242a36", "#edf2f7");
  const { selectedFloorOption, floorOptionData, handleFloorOptionClick } =
    useContext(MapContext);

  return (
    <Flex
      flexDirection={"column"}
      zIndex={1}
      pos={"absolute"}
      justify={"space-between"}
      align={"center"}
      top={"46%"}
      right={"20px"}
      bg={colorBgFloorOption}
      borderRadius={"10.5px"}
      p={"2px"}
      w={"36px"}
      h={"100px"}
    >
      {floorOptionData.map((item) => {
        return (
          <Button
            key={item.id}
            name={item.name}
            onClick={handleFloorOptionClick}
            size={"sm"}
            bg={
              selectedFloorOption === item.name
                ? colorFloorOptionCurrent
                : colorBgFloorOption
            }
            _hover={{ bg: "#4da2ff" }}
            borderRadius={"9px"}
            color={
              selectedFloorOption === item.name
                ? colorTextCurrentFloorOption
                : colorTextFloorOption
            }
          >
            {item.id}
          </Button>
        );
      })}
    </Flex>
  );
};

export default FloorOptionButton;
