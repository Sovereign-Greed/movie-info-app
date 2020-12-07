console.log("scripts connected!");


// image overlay effect
$(".imgContainer").hover(
function() {
	$(this).find(".image").addClass("overlayImg");
	$(this).find(".middle").addClass("overlayText");
}	, function() {
	$(this).find(".image").removeClass("overlayImg");
	$(this).find(".middle").removeClass("overlayText");
	}
)

