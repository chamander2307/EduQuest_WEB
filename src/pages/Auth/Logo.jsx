import LogoSrc from "../../assets/images/Eduquest.svg";

const EduQuestLogo = ({ size = 300 }) => (
  <img
    src={LogoSrc}
    alt="EduQuest Logo"
    style={{ width: size, height: "auto" }}
  />
);

export default EduQuestLogo;
