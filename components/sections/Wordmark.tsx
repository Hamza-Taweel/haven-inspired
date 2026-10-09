import Container from "@/components/ui/Container";

export default function Wordmark() {
  return (
    <section className="relative z-0 bg-white">
      <Container>
        {/* 22px gap between the header paragraph and the Haven wordmark */}
        <div className="mx-auto w-full max-w-[98%] pt-5.5" data-hero-heading>
          <svg
            viewBox="0 0 1414 419"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-auto w-full overflow-hidden box-border bg-white text-black"
          >
            <path
              className="inline box-border"
              d="M1161.38 411.642V118.417H1226.79V156.762C1242.01 133.642 1271.9 111.65 1313.63 111.65C1375.09 111.65 1414 156.198 1414 220.482V411.642H1348.59V233.452C1348.59 193.415 1329.98 166.348 1290.51 166.348C1257.8 166.348 1226.79 190.596 1226.79 237.399V411.642H1161.38Z"
              fill="#0c388d"
            />
            <path
              className="inline box-border"
              d="M1135.13 318.6C1126.11 377.245 1078.18 418.409 1008.82 418.409C926.495 418.409 868.979 355.817 868.979 265.594C868.979 177.626 928.751 111.65 1008.82 111.65C1092.84 111.65 1139.65 176.498 1139.65 258.263C1139.65 267.285 1139.08 273.488 1137.39 282.51H931.007C936.645 339.464 969.915 365.967 1008.82 365.967C1046.04 365.967 1068.6 347.358 1076.49 318.6H1135.13ZM1008.26 164.093C964.276 164.093 940.593 194.543 933.262 234.579H1076.49C1075.93 197.362 1051.68 164.093 1008.26 164.093Z"
              fill="#0c388d"
            />
            <path
              className="inline box-border"
              d="M783.267 411.635H716.164L609.589 118.41H677.819L750.561 336.637L822.739 118.41H888.714L783.267 411.635Z"
              fill="#0c388d"
            />
            <path
              className="inline box-border"
              d="M523.025 228.94C542.198 226.121 552.348 217.099 552.348 200.182C552.348 178.19 533.176 161.837 499.342 161.837C463.817 161.837 442.953 179.318 439.57 207.512H374.723C380.362 155.07 424.345 111.65 499.906 111.65C579.414 111.65 615.503 152.251 615.503 218.226V351.869C615.503 371.606 616.631 390.778 618.887 411.642H557.423C555.167 400.364 554.039 387.959 553.476 375.553C537.123 400.928 502.725 418.409 464.381 418.409C409.12 418.409 361.753 385.703 361.753 329.877C361.753 270.669 406.3 246.985 464.945 237.963L523.025 228.94ZM423.217 327.058C423.217 355.253 444.645 369.35 473.967 369.35C515.695 369.35 552.348 344.539 552.348 295.48V270.105L480.17 281.947C448.028 287.585 423.217 297.172 423.217 327.058Z"
              fill="#0c388d"
            />
            <path
              className="inline box-border"
              d="M272.358 0H340.025V411.643H272.358V231.197H67.6667V411.643H0V0H67.6667V170.86H272.358V0Z"
              fill="#0c388d"
            />
          </svg>
        </div>

        {/*
         * Est. 1990 (left) / Melbourne (right). The negative margins cancel
         * Container's own gutter so `px-11.75` can pin each label exactly
         * 47px from the viewport edge. Both are 14.7px on a 22px line.
         */}
        <div className="-mx-4 mt-3 flex items-center justify-between px-11.75 uppercase tracking-wider text-black sm:-mx-8">
          <span className="text-[14.7px] leading-5.5">Est. 1990</span>
          <span className="text-[14.7px] leading-5.5">Melbourne</span>
        </div>
      </Container>
    </section>
  );
}
